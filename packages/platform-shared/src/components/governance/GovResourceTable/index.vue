<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BCard
      class="border-0 shadow-none"
      no-body>
      <BCardHeader
        v-if="!isNoResultsFirstLoad"
        class="p-0">
        <BButtonToolbar class="justify-content-between p-3 border-bottom-0">
          <BButton
            v-if="allowAdd"
            variant="primary"
            @click="showAddModal">
            <FrIcon
              class="mr-2"
              name="add" />{{ $t('common.addObject', { object: capitalizedPluralGrantType }) }}
          </BButton>
          <FrSearchInput
            v-model="searchQuery"
            class="col-12 col-lg-auto p-0"
            data-testid="search-gov-resource-table"
            :placeholder="$t('common.search')"
            @clear="loadData({ paginationPage: 1, searchQuery: '' })"
            @search="loadData({ paginationPage: 1 })" />
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
        class="border-0 shadow-none"
        icon="people"
        body-class="mb-5"
        data-testid="gov-resource-table-no-results-first-load"
        :title="$t('governance.access.noRecordFound', { grantType: pluralizeValue(grantType) })"
        :subtitle="isNoResultsFirstLoad ? $t('governance.access.noResultsUser', { grantType: pluralizeValue(grantType) }) : $t('common.noResultsHelp')">
        <BButton
          v-if="allowAdd"
          variant="primary"
          @click="showAddModal">
          <FrIcon
            class="mr-2"
            name="add" />{{ $t('common.addObject', { object: capitalizedPluralGrantType }) }}
        </BButton>
      </FrNoData>
      <BTable
        v-else
        v-model:sort-by="sortBy"
        v-model:sort-desc="sortDesc"
        :busy="isLoading"
        class="mb-0"
        :class="{ 'cursor-pointer': showViewDetails }"
        data-testid="gov-resource-table"
        :fields="fields"
        :hover="showViewDetails"
        id="gov-resource-table"
        :items="itemsWithAssignment"
        no-local-sorting
        no-sort-reset
        responsive
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
            boundary="scrollParent"
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
                v-if="(item.assignment === directAssignment || item.assignment === staticAssignment)"
                @click="showRevokeRequestModal(item)">
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
        aria-controls="gov-resource-table"
        :per-page="paginationPageSize"
        :total-rows="totalCount"
        @change="loadData({ paginationPage: $event })"
        @on-page-size-change="loadData({ paginationPageSize: $event, paginationPage: 1 })" />
      <FrUserEntitlementModal
        :grant="grantDetails"
        :glossary-schema="glossarySchema"
        modal-id="userEntitlementModal" />
    </BCard>
    <FrGovAssignResourceModal
      :entitlement-options="entitlementOptions"
      :is-saving="assigningResource"
      :parent-resource-name="parentResourceName"
      :resource-type="pluralizeValue(grantType)"
      @assign-resources="assignResources"
      @get-entitlements="getEntitlements" />
    <FrRevokeRequestModal
      :modal-id="revokeModalId"
      :show-spinner="isSubmittingRevokeRequest"
      @hidden="resetRevokeRequestModal"
      @submission="submitRevokeRequest" />
  </div>
</template>

<script>
import { capitalize, get } from 'lodash';
import {
  BBadge,
  BButton,
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
import { pluralizeValue } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getGlossarySchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrUserEntitlementModal from '@forgerock/platform-shared/src/components/governance/UserEntitlementModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import formatConstraintDate from '@forgerock/platform-shared/src/utils/governance/temporalConstraints';
import { searchCatalog } from '@forgerock/platform-shared/src/api/governance/CatalogApi';
// import { patchManagedResource } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { saveNewRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import FrGovAssignResourceModal from '../GovAssignResourceModal';
import FrRevokeRequestModal from '../RevokeRequestModal';

export default {
  name: 'GovResourceTable',
  components: {
    BBadge,
    BButton,
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
    FrGovAssignResourceModal,
    FrIcon,
    FrNoData,
    FrPagination,
    FrRevokeRequestModal,
    FrSearchInput,
    FrSpinner,
    FrUserEntitlementModal,
  },
  mixins: [
    NotificationMixin,
  ],
  props: {
    adminAccess: {
      type: Boolean,
      default: true,
    },
    allowAdd: {
      type: Boolean,
      default: false,
    },
    fields: {
      type: Array,
      required: true,
    },
    grantType: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      default: '',
    },
    items: {
      type: Array,
      default: () => [],
    },
    modalId: {
      type: String,
      default: 'gov-resource',
    },
    parentResourceName: {
      type: String,
      default: '',
    },
    showViewDetails: {
      type: Boolean,
      default: false,
    },
    totalCount: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      assigningResource: false,
      blankValueIndicator,
      directAssignment: this.$t('common.direct'),
      entitlementOptions: [],
      glossarySchema: [],
      grantDetails: {},
      isLoading: true,
      isNoResultsFirstLoad: null,
      isSubmittingRevokeRequest: false,
      paginationPage: 1,
      paginationPageSize: 10,
      requestToRevoke: '',
      roleBasedAssignment: this.$t('pages.assignment.roleBased'),
      ruleBasedAssignment: this.$t('pages.assignment.ruleBased'),
      searchQuery: '',
      sortDesc: null,
      sortBy: null,
      staticAssignment: this.$t('common.static'),
    };
  },
  async mounted() {
    this.loadData({ sortBy: this.fields[0].key });
    if (this.showViewDetails) {
      try {
        const { data } = await getGlossarySchema();
        this.glossarySchema = data['/openidm/managed/assignment'];
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.certificationTask.errors.glossaryError'));
      }
    }
  },
  computed: {
    capitalizedPluralGrantType() {
      return capitalize(pluralizeValue(this.grantType));
    },
    itemsWithAssignment() {
      return this.items.map((item) => ({
        ...item,
        assignment: this.assignmentHandler(item),
      }));
    },
    resourceIsRole() {
      return this.parentResourceName.endsWith('role');
    },
    revokeModalId() {
      return `${this.modalId}-revoke`;
    },
    revokeRequestCatalog() {
      if (Object.keys(this.requestToRevoke).length) {
        const { item, catalog } = this.requestToRevoke;
        const id = get(catalog, 'id', '');
        if (item.type === 'entitlementGrant') {
          return [{ type: 'entitlement', id }];
        }
        if (item.type === 'accountGrant') {
          return [{ type: 'application', id }];
        }
        if (item.type === 'roleMembership') {
          return [{ type: 'role', id }];
        }
      }
      return [];
    },
    resourceIsUser() {
      return this.parentResourceName.endsWith('user');
    },
  },
  methods: {
    formatConstraintDate,
    assignmentHandler(membership) {
      switch (membership.item?.type) {
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
    async assignResources(resourceIds) {
      this.assigningResource = true;
      if (this.resourceIsUser) {
        const entitlements = resourceIds.map((resourceId) => ({ type: 'entitlement', id: resourceId }));

        const payload = {
          accessModifier: 'add',
          catalogs: entitlements,
          context: { type: 'admin' },
          users: [this.id],
        };
        try {
          const { data } = await saveNewRequest(payload);
          if (data?.errors.length) {
            data.errors.forEach((error) => {
              this.showErrorMessage(error, error.message);
            });
          }
          if (!data?.errors?.length || data.errors.length < resourceIds.length) {
            this.displayNotification('success', this.$t('governance.resource.successfullyAdded', { resource: capitalize(this.grantType) }));
            this.$bvModal.hide('govCreateResourceModal');
          }
        } catch (error) {
          this.showErrorMessage(error, this.$t('governance.resource.errors.errorCreatingAccessRequest'));
        }
      } else if (this.resourceIsRole) {
        // TODO: Logic for assign-to-role flow in related ticket within same epic
        // const saveData = [];
        // resourceIds.forEach((resourceId) => {
        //   saveData.push({
        //     operation: 'add',
        //     field: '/assignments/-',
        //     value: resourceId,
        //   });
        // });

        // const requestOverride = { headers: { 'if-match': managedResource._rev } };
        // try {
        //   await patchManagedResource(this.resourceName, this.id, saveData, requestOverride);
        //   this.$bvModal.hide('govCreateResourceModal');
        // } catch (error) {
        //   this.showErrorMessage(error, this.$t('governance.resource.errors.errorCreatingAccessRequest'));
        // }
      }
      this.assigningResource = false;
    },
    convertFieldNameToSortKey(fieldName) {
      const sortByUser = {
        accountName: 'descriptor.idx./account.displayName',
        appName: 'application.name',
        entitlementName: 'descriptor.idx./entitlement.displayName',
        entitlementNameAppName: 'descriptor.idx./entitlement.displayName',
        roleName: 'role.name',
        status: '',
      };
      return this.resourceIsRole ? 'name' : sortByUser[fieldName] ?? null;
    },
    getApplicationLogo,
    /**
     * Search the request catalog for entitlements using the provided search value
     * @param {Object} $event Contains search value and selected application
     * @param {String} searchValue search value to find entitlements by
     * @param {String} selectedApplication Application to query entitlements by
     */
    async getEntitlements({ searchValue = '', selectedApplication }) {
      try {
        const searchParams = {
          fields: 'application,entitlement,id,descriptor,glossary',
          pageSize: 10,
          sortKeys: 'assignment.name',
        };
        const payload = {
          targetFilter: {
            operator: 'AND',
            operand: [
              {
                operator: 'EQUALS',
                operand: {
                  targetName: 'item.type',
                  targetValue: 'entitlementGrant',
                },
              },
              {
                operator: 'EQUALS',
                operand: {
                  targetName: 'application.id',
                  targetValue: selectedApplication,
                },
              },
              {
                operator: 'CONTAINS',
                operand: {
                  targetName: 'assignment.name',
                  targetValue: searchValue,
                },
              },
            ],
          },
        };

        const { data } = await searchCatalog(searchParams, payload);
        this.entitlementOptions = data?.result.map((result) => ({ value: this.resourceIsUser ? result.id : result.entitlement._id, text: result.entitlement.displayName })) || [];
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.resource.errors.errorSearchingCatalog'));
      }
    },
    getDisplayName(item) {
      if (this.grantType === 'account') {
        return this.getResourceDisplayName(item, '/account');
      }
      return getApplicationDisplayName(item.application);
    },
    getResourceDisplayName(item, resource) {
      if (this.resourceIsRole) {
        return item.name;
      }
      return item.descriptor?.idx?.[resource]?.displayName;
    },
    /**
     * Determines the assignment label for accounts and entitlements
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
     * Obtains a list of resources to display
     * @param {Object} updatedParams - Optional (default {}) any params that need to be updated for new query
     */
    loadData(updatedParams = {}) {
      Object.keys(updatedParams).forEach((key) => {
        this[key] = updatedParams[key];
      });
      this.isLoading = true;
      const params = {
        pageSize: this.paginationPageSize,
        pageNumber: this.paginationPage - 1,
        sortDir: this.sortDesc ? 'desc' : 'asc',
        sortBy: this.convertFieldNameToSortKey(this.sortBy),
        grantType: this.grantType,
      };
      if (this.searchQuery) {
        params.queryString = this.searchQuery;
      }
      this.$emit('load-data', params);
    },
    pluralizeValue,
    resetRevokeRequestModal() {
      this.isSubmittingRevokeRequest = false;
      this.requestToRevoke = {};
    },
    /**
     * Opens modal to add grant type
     */
    showAddModal() {
      this.$bvModal.show('govCreateResourceModal');
    },
    showRevokeRequestModal(request) {
      this.requestToRevoke = request;
      this.$bvModal.show(this.revokeModalId);
    },
    sortChanged(event) {
      const { sortBy, sortDesc } = event;
      this.loadData({ sortBy, sortDesc, paginationPage: 1 });
    },
    async submitRevokeRequest(payload) {
      this.isSubmittingRevokeRequest = true;
      try {
        payload.accessModifier = 'remove';
        payload.catalogs = this.revokeRequestCatalog;
        payload.users = [this.id];
        if (this.adminAccess) payload.context = { type: 'admin' };

        const { data } = await saveNewRequest(payload);

        if (data.errors?.length) this.showErrorMessage(null, data.errors[0].message);
        else this.displayNotification('success', this.$t('governance.request.requestSuccess'));
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.request.requestError'));
      } finally {
        this.$bvModal.hide(this.revokeModalId);
      }
    },
  },
  watch: {
    items(items) {
      this.isNoResultsFirstLoad = !items.length && this.isNoResultsFirstLoad === null;
      this.isLoading = false;
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
