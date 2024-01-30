<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard
    class="border-0 shadow-none"
    no-body>
    <BCardHeader
      v-if="!isNoResultsFirstLoad"
      class="p-0">
      <BButtonToolbar class="justify-content-end p-3 border-bottom-0">
        <FrSearchInput
          v-model="searchQuery"
          class="col-12 col-lg-auto p-0"
          data-testid="search-my-access-review-table"
          :placeholder="$t('common.search')"
          @clear="clear"
          @search="loadData()" />
      </BButtonToolbar>
    </BCardHeader>
    <div v-if="isLoading">
      <FrSpinner class="py-5" />
      <div class="text-center pb-4 font-bold">
        {{ $t('common.loading') }}
      </div>
    </div>
    <FrNoData
      v-else-if="items.length === 0"
      icon="people"
      body-class="mb-5"
      data-testid="my-access-review-table-no-results-first-load"
      :title="$t('governance.access.noRecordFound', { grantType: pluralizeValue(grantType) })"
      :subtitle="isNoResultsFirstLoad ? $t('governance.access.noResultsUser', { grantType: pluralizeValue(grantType) }) : $t('common.noResultsHelp')"
      :card="false" />
    <BTable
      v-else
      :class="['mb-0', { 'cursor-pointer': showViewDetails }]"
      id="my-access-review-table"
      data-testid="my-access-review-table"
      no-local-sorting
      no-sort-reset
      responsive
      :fields="fields"
      :items="itemsWithAssignment"
      :hover="showViewDetails"
      :busy="isLoading"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      @row-clicked="handleRowClick"
      @sort-changed="sortChanged">
      <template #cell(accountName)="{ item }">
        <p class="mb-0 text-truncate text-dark">
          {{ getResourceDisplayName(item, '/account') }}
        </p>
      </template>
      <template #cell(appName)="{ item }">
        <BMedia no-body>
          <BMediaAside class="mr-4 align-self-center">
            <BImg
              :alt="$t('common.logo')"
              :src="getApplicationLogo(item.application) || require('@forgerock/platform-shared/src/assets/images/placeholder.svg')"
              :aria-hidden="true"
              width="24"
              height="24" />
          </BMediaAside>
          <BMediaBody class="text-truncate">
            <h3 class="h5 mb-0 text-truncate">
              {{ item.application.name }}
            </h3>
            <small class="text-muted">
              {{ getDisplayName(item) }}
            </small>
          </BMediaBody>
        </BMedia>
      </template>
      <template #cell(entitlementNameAppName)="{ item }">
        <BMedia no-body>
          <BMediaAside class="mr-4 align-self-center">
            <BImg
              :alt="$t('common.logo')"
              :src="getApplicationLogo(item.application) || require('@forgerock/platform-shared/src/assets/images/placeholder.svg')"
              aria-hidden
              width="24"
              height="24" />
          </BMediaAside>
          <BMediaBody class="text-truncate">
            <h3 class="h5 mb-0 text-truncate">
              {{ getResourceDisplayName(item, '/entitlement') }}
            </h3>
            <small class="text-muted">
              {{ item.application.name }}
            </small>
          </BMediaBody>
        </BMedia>
      </template>
      <template #cell(entitlementName)="{ item }">
        <p class="mb-0 text-truncate text-dark">
          {{ getResourceDisplayName(item, '/entitlement') }}
        </p>
      </template>
      <template #cell(roleName)="{ item }">
        <BMedia
          no-body
          class="d-flex align-items-end">
          <div class="d-flex align-items-center justify-content-center rounded rounded-circle bg-light mr-3 text-dark icon">
            <BMediaAside
              vertical-align="center"
              class="ml-3">
              <FrIcon name="assignment_ind" />
            </BMediaAside>
          </div>
          <BMediaBody
            class="text-truncate"
            vertical-align="center">
            <h3 class="h5 text-truncate">
              {{ item.role.name }}
            </h3>
          </BMediaBody>
        </BMedia>
      </template>
      <template #cell(status) />
      <template #cell(timeConstraint)="{ item }">
        <p class="mb-0">
          {{ formatConstraintDate(item.relationship.temporalConstraints) || blankValueIndicator }}
        </p>
      </template>
      <template #cell(assignment)="{ item }">
        <BBadge
          class="font-weight-normal w-100px"
          data-testid="status-badge"
          :variant="item.assignment === directAssignment ? 'success' : 'light'">
          {{ item.assignment }}
        </BBadge>
      </template>
      <template #cell(actions)="{ item }">
        <FrActionsCell
          v-if="item.assignment === directAssignment || item.assignment === staticAssignment || showViewDetails"
          test-id="relationship-menu"
          :delete-option="false"
          :divider="false"
          :edit-option="false">
          <template #custom-top-actions>
            <BDropdownItem
              v-if="showViewDetails"
              @click="handleRowClick(item)">
              <FrIcon
                class="mr-2"
                name="list_alt" />{{ $t('common.viewDetails') }}
            </BDropdownItem>
            <BDropdownItem
              v-if="(item.assignment === directAssignment || item.assignment === staticAssignment) && adminAccess"
              @click="$emit('revoke-request', item);">
              <FrIcon
                class="mr-2"
                name="delete" />{{ $t('common.revoke') }}
            </BDropdownItem>
          </template>
        </FrActionsCell>
      </template>
    </BTable>
    <FrPagination
      v-if="totalCount > 10"
      v-model="paginationPage"
      aria-controls="my-access-review-table"
      :per-page="paginationPageSize"
      :total-rows="totalCount"
      @input="pageChange"
      @on-page-size-change="pageSizeChange" />
    <FrUserEntitlementModal
      :grant="grantDetails"
      :glossary-schema="glossarySchema"
      modal-id="userEntitlementModal" />
  </BCard>
</template>

<script>
import {
  BBadge,
  BButtonToolbar,
  BCard,
  BCardHeader,
  BDropdownItem,
  BImg,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { pluralizeValue } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getUserGrants, getGlossarySchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrUserEntitlementModal from '@forgerock/platform-shared/src/components/governance/UserEntitlementModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import formatConstraintDate from '@forgerock/platform-shared/src/utils/governance/temporalConstraints';

export default {
  name: 'MyAccessReviewTable',
  components: {
    BBadge,
    BButtonToolbar,
    BCard,
    BCardHeader,
    BDropdownItem,
    BImg,
    BMedia,
    BMediaAside,
    BMediaBody,
    BTable,
    FrActionsCell,
    FrUserEntitlementModal,
    FrIcon,
    FrPagination,
    FrSearchInput,
    FrSpinner,
    FrNoData,
  },
  mixins: [
    NotificationMixin,
  ],
  props: {
    adminAccess: {
      type: Boolean,
      default: true,
    },
    defaultSort: {
      type: String,
      required: true,
    },
    grantType: {
      type: String,
      required: true,
    },
    fields: {
      type: Array,
      required: true,
    },
    userId: {
      type: String,
      default: '',
    },
    showViewDetails: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      blankValueIndicator,
      directAssignment: this.$t('common.direct'),
      grantDetails: {},
      glossarySchema: [],
      isLoading: true,
      isNoResultsFirstLoad: false,
      items: [],
      paginationPage: 1,
      paginationPageSize: 10,
      roleBasedAssignment: this.$t('pages.assignment.roleBased'),
      ruleBasedAssignment: this.$t('pages.assignment.ruleBased'),
      searchQuery: '',
      sortDesc: null,
      sortBy: null,
      staticAssignment: this.$t('common.static'),
      totalCount: 0,
    };
  },
  async mounted() {
    this.setup();
    if (this.showViewDetails) {
      try {
        const { data } = await getGlossarySchema();
        this.glossarySchema = [data['/openidm/managed/assignment']];
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.glossaryError'));
      }
    }
  },
  computed: {
    itemsWithAssignment() {
      return this.items.map((item) => ({
        ...item,
        assignment: this.assignmentHandler(item),
      }));
    },
  },
  methods: {
    formatConstraintDate,
    assignmentHandler(membership) {
      switch (membership.item.type) {
        case 'accountGrant':
          return this.grantTypeLabel(membership);
        case 'entitlementGrant':
          return this.grantTypeLabel(membership);
        case 'roleMembership':
          return membership?.role?.condition ? this.ruleBasedAssignment : this.directAssignment;
        default:
          return '';
      }
    },
    clear() {
      this.paginationPage = 1;
      this.searchQuery = '';
      this.loadData();
    },
    getApplicationLogo,
    getDisplayName(item) {
      if (this.grantType === 'account') {
        return this.getResourceDisplayName(item, '/account');
      }
      return getApplicationDisplayName(item.application);
    },
    getResourceDisplayName(item, resource) {
      return item.descriptor?.idx?.[resource]?.displayName;
    },
    /**
     * Loads a list for MyAccess (accounts/entitlements/roles) based on the current path
     * @param {object} params - Parameters to be plugged into query string
     * @param {Boolean} isInit - Parameter check whether the component is inital rendering, passed from loadData()
     */
    getMyAccess(params, isInit = false) {
      const userStore = useUserStore();
      params.grantType = this.grantType;
      const userId = this.userId || userStore.userId;
      getUserGrants(userId, params).then(({ data }) => {
        this.items = data.result;
        this.totalCount = data.totalCount;
        if (isInit && !this.totalCount) {
          this.isNoResultsFirstLoad = true;
        } else {
          this.isNoResultsFirstLoad = false;
        }
      }).catch((err) => {
        this.showErrorMessage(err, this.$t('governance.access.errorGettingData', { grantType: pluralizeValue(this.grantType) }));
      }).finally(() => {
        this.isLoading = false;
      });
    },
    /**
     * Determines the assignment label for accounts and ententitlements
     * @param {Object} membership - table membership item object
     */
    grantTypeLabel(membership) {
      const grantTypes = membership?.relationship?.properties?.grantTypes;
      if (grantTypes) {
        const foundGrantType = grantTypes.find((grantType) => grantType.id === membership.relationship.id);
        return foundGrantType.grantType === 'role' ? this.roleBasedAssignment : this.directAssignment;
      }
      return '';
    },
    handleRowClick(item) {
      if (this.showViewDetails && this.grantType === 'entitlement') {
        this.grantDetails = { ...item };
        this.$bvModal.show('userEntitlementModal');
      }
    },
    /**
     * Loads a list for MyAccess
     * @param {Boolean} isInit - Optional parameter check whether the component is inital rendering, default is false
     */
    loadData(isInit = false) {
      this.isLoading = true;
      const params = {
        pageSize: this.paginationPageSize,
        pageNumber: this.paginationPage - 1,
      };
      if (this.searchQuery !== '') {
        params.queryString = this.searchQuery;
      }
      params.sortDir = this.sortDesc ? 'desc' : 'asc';
      params.sortBy = this.sortBy;
      this.$emit('load-data', params);
      this.getMyAccess(params, isInit);
    },
    pageChange(page) {
      this.paginationPage = page;
      this.loadData();
    },
    pageSizeChange(pageSize) {
      this.paginationPageSize = pageSize;
      this.loadData();
    },
    pluralizeValue,
    setup() {
      this.sortBy = this.defaultSort;
      this.loadData(true);
    },
    sortChanged(event) {
      const { sortBy, sortDesc } = event;
      switch (sortBy) {
        case 'accountName':
          this.sortBy = 'descriptor.idx./account.displayName';
          break;
        case 'appName':
          this.sortBy = 'application.name';
          break;
        case 'entitlementName':
        case 'entitlementNameAppName':
          this.sortBy = 'descriptor.idx./entitlement.displayName';
          break;
        case 'roleName':
          this.sortBy = 'role.name';
          break;
        case 'status':
          this.sortBy = '';
          break;
        default:
          this.sortBy = null;
          return;
      }
      this.sortDesc = sortDesc;
      this.loadData();
    },
  },
};
</script>

<style lang="scss" scoped>
.icon {
  height: 34px;
  width: 34px;
}
</style>
