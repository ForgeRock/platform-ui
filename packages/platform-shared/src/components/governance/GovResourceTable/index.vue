<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div id="gov-resource-table-component">
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
            @click="$bvModal.show('govCreateResourceModal')">
            <FrIcon
              icon-class="mr-2"
              name="add">
              {{ $t('common.addObject', { object: capitalizedPluralGrantType }) }}
            </FrIcon>
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
        :title="$t('governance.access.noRecordFound', { grantType: pluralizedGrantType })"
        :subtitle="isNoResultsFirstLoad ? $t('governance.access.noResultsUser', { grantType: pluralizedGrantType }) : $t('common.noResultsHelp')">
        <BButton
          v-if="allowAdd"
          variant="primary"
          @click="$bvModal.show('govCreateResourceModal')">
          <FrIcon
            icon-class="mr-2"
            name="add">
            {{ $t('common.addObject', { object: capitalizedPluralGrantType }) }}
          </FrIcon>
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
        :fields="fieldsWithSelected"
        :hover="showViewDetails"
        id="gov-resource-table"
        :items="itemsWithAssignment"
        no-local-sorting
        no-sort-reset
        ref="gov-resource-table"
        responsive
        :selectable="allowSelect"
        @row-selected="onRowSelected"
        @sort-changed="sortChanged">
        <template #head(selected)>
          <div
            class="cursor-pointer"
            @click="onToggleSelectAll">
            <BFormCheckbox
              class="pl-3"
              disabled
              v-model="allRowsSelected">
              <span class="sr-only">
                {{ $t('common.select') }}
              </span>
            </BFormCheckbox>
          </div>
        </template>
        <template #cell(selected)="data">
          <BFormCheckbox
            v-if="!data.item.assignment || data.item.assignment === directAssignment"
            class="pl-3"
            :id="`rowSelectCheckbox_${grantType}_${data.index}`"
            @change="onCheckboxClicked(data)"
            v-model="data.rowSelected">
            <span class="sr-only">
              {{ $t('common.selectSelection', { selection: data.item.name || '' }) }}
            </span>
          </BFormCheckbox>
        </template>
        <template #cell(accountName)="{ item }">
          <p class="mb-0 text-truncate text-dark">
            {{ getResourceDisplayName(item, '/account') }}
          </p>
        </template>
        <template #cell(appName)="{ item }">
          <BMedia no-body>
            <BMediaAside class="mr-4 align-self-center">
              <img
                :alt="$t('common.logo')"
                :src="getApplicationLogo(item.application) || require('@forgerock/platform-shared/src/assets/images/placeholder.svg')"
                aria-hidden
                :onerror="onImageError"
                width="24"
                height="24">
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
              <img
                :alt="$t('common.logo')"
                :src="getApplicationLogo(item.application) || require('@forgerock/platform-shared/src/assets/images/placeholder.svg')"
                aria-hidden
                :onerror="onImageError"
                width="24"
                height="24">
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
                  icon-class="mr-2"
                  name="list_alt">
                  {{ $t('common.viewDetails') }}
                </FrIcon>
              </BDropdownItem>
              <BDropdownItem
                v-if="item.assignment === directAssignment || item.assignment === staticAssignment || resourceIsRole"
                @click="showRevokeModal([item])">
                <FrIcon
                  icon-class="mr-2"
                  name="delete">
                  {{ $t('common.revoke') }}
                </FrIcon>
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
    </BCard>
    <FrGovAssignResourceModal
      :entitlement-options="entitlementOptions"
      :is-saving="assigningResource"
      :parent-resource-name="parentResourceName"
      :resource-type="pluralizedGrantType"
      @assign-resources="$emit('assign-resources', $event)"
      @get-entitlements="$emit('get-entitlements', $event)" />
    <FrRevokeRequestModal
      :require-request-justification="!parentResourceName && requireRequestJustification"
      :modal-id="revokeModalId"
      :show-spinner="assigningResource"
      @submission="$emit('revoke-items', { ...$event, itemsToRevoke })" />
    <BModal
      id="revoke-from-role-modal"
      no-close-on-backdrop
      no-close-on-esc
      :static="isTesting"
      :title="$tc('governance.access.revokeEntitlement', itemsToRevoke.length)">
      {{ $tc('governance.access.confirmRevokeEntitlement', itemsToRevoke.length) }}
      <template #modal-footer="{ cancel }">
        <BButton
          variant="link"
          class="text-danger"
          @click="cancel()">
          {{ $t('common.cancel') }}
        </BButton>
        <FrButtonWithSpinner
          :button-text="$t('common.revoke')"
          :disabled="assigningResource"
          :show-spinner="assigningResource"
          :spinner-text="$t('governance.access.revoking')"
          variant="danger"
          @click="$emit('revoke-items', itemsToRevoke)" />
      </template>
    </BModal>
    <FrUserEntitlementModal
      :show-account-tab="!resourceIsRole"
      :grant="grantDetails"
      :glossary-schema="glossarySchema"
      modal-id="userEntitlementModal" />
    <FrFloatingActionBar
      :buttons="actionBarButtons"
      :count="selectedItems.length"
      @deselect="onToggleSelectAll(false)"
      @revoke="showRevokeModal(selectedItems)" />
  </div>
</template>

<script>
import { capitalize, countBy } from 'lodash';
import {
  BBadge,
  BButton,
  BButtonToolbar,
  BCard,
  BCardHeader,
  BDropdownItem,
  BFormCheckbox,
  BMedia,
  BMediaAside,
  BMediaBody,
  BTable,
} from 'bootstrap-vue';
import { pluralizeValue } from '@forgerock/platform-shared/src/utils/PluralizeUtils';
import { getApplicationDisplayName, getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getGlossarySchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { onImageError } from '@forgerock/platform-shared/src/utils/applicationImageResolver';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrFloatingActionBar from '@forgerock/platform-shared/src/components/FloatingActionBar/FloatingActionBar';
import FrUserEntitlementModal from '@forgerock/platform-shared/src/components/governance/UserEntitlementModal';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import formatConstraintDate from '@forgerock/platform-shared/src/utils/governance/temporalConstraints';
import FrGovAssignResourceModal from '../GovAssignResourceModal';
import FrRevokeRequestModal from '../RevokeRequestModal';
import i18n from '@/i18n';

export default {
  name: 'GovResourceTable',
  components: {
    BBadge,
    BButton,
    BButtonToolbar,
    BCard,
    BCardHeader,
    BDropdownItem,
    BFormCheckbox,
    BMedia,
    BMediaAside,
    BMediaBody,
    BTable,
    FrActionsCell,
    FrButtonWithSpinner,
    FrFloatingActionBar,
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
    allowAdd: {
      type: Boolean,
      default: false,
    },
    allowSelect: {
      type: Boolean,
      default: false,
    },
    awaitingApi: {
      type: Boolean,
      default: false,
    },
    entitlementOptions: {
      type: Array,
      default: () => [],
    },
    fields: {
      type: Array,
      required: true,
    },
    grantType: {
      type: String,
      required: true,
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
    requireRequestJustification: {
      type: Boolean,
      default: false,
    },
    savingStatus: {
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
      actionBarButtons: [{
        event: 'revoke',
        icon: 'close',
        iconClass: 'text-danger',
        label: i18n.global.t('common.revoke'),
      }],
      allRowsSelected: false,
      blankValueIndicator,
      directAssignment: this.$t('common.direct'),
      glossarySchema: [],
      grantDetails: {},
      isLoading: true,
      isNoResultsFirstLoad: null,
      paginationPage: 1,
      paginationPageSize: 10,
      itemsToRevoke: [],
      roleBasedAssignment: this.$t('pages.assignment.roleBased'),
      ruleBasedAssignment: this.$t('pages.assignment.ruleBased'),
      searchQuery: '',
      selectedItems: [],
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
    assigningResource() {
      return this.savingStatus === 'saving';
    },
    capitalizedPluralGrantType() {
      return capitalize(this.pluralizedGrantType);
    },
    fieldsWithSelected() {
      if (this.allowSelect) {
        return [
          {
            key: 'selected',
            label: '',
            class: 'checkbox-column',
          },
          ...this.fields,
        ];
      }
      return this.fields;
    },
    itemsWithAssignment() {
      return this.items.map((item) => ({
        ...item,
        assignment: this.assignmentHandler(item),
      }));
    },
    pluralizedGrantType() {
      return pluralizeValue(this.grantType);
    },
    resourceIsRole() {
      return this.parentResourceName.endsWith('role');
    },
    revokeModalId() {
      return `${this.modalId}-revoke`;
    },
  },
  methods: {
    assignmentHandler(membership) {
      switch (membership.item?.type) {
        case 'accountGrant':
          return this.grantTypeLabel(membership);
        case 'entitlementGrant':
          return this.grantTypeLabel(membership);
        case 'roleMembership':
          return membership?.relationship?.conditional ? this.ruleBasedAssignment : this.directAssignment;
        default:
          return '';
      }
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
    formatConstraintDate,
    getApplicationLogo,
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
    /**
     * Selects or unselects  specific table row
     * @param {Object} row details of table row
     */
    onCheckboxClicked(row) {
      if (row.rowSelected) {
        this.$refs['gov-resource-table'].selectRow(row.index);
      } else {
        this.$refs['gov-resource-table'].unselectRow(row.index);
      }
    },
    onImageError,
    /**
     * Verifies selected row is a row that should be able to be revoked, and adds to selected array if so
     * @param {Array} selectedItems Currently selected table rows
     */
    onRowSelected(selectedItems) {
      this.selectedItems = [];
      selectedItems.forEach((item) => {
        if (item.assignment === this.roleBasedAssignment) {
          const index = this.itemsWithAssignment.findIndex((itemWithAssignment) => itemWithAssignment.compositeId === item.compositeId);
          this.$refs['gov-resource-table'].unselectRow(index);
        } else {
          this.selectedItems.push(item);
        }
      });
      const selectableItemsOnPage = countBy(this.itemsWithAssignment, (itemWithAssignment) => !itemWithAssignment.assignment || itemWithAssignment.assignment === this.directAssignment).true;
      this.allRowsSelected = selectedItems.length === selectableItemsOnPage;
    },
    /**
     * Toggles all checkboxes on or off
     * @param {Boolean} toggleAll Whether all checkboxes should be checked or not
     */
    onToggleSelectAll(toggleAll = true) {
      const grid = this.$refs['gov-resource-table'];

      if (grid) {
        if (!this.allRowsSelected && toggleAll) {
          grid.selectAllRows();
        } else {
          grid.clearSelected();
        }
      }
    },
    /**
     * Shows one of two revoke modals
     * @param {Array} itemsToRevoke list of items that are being revoked
     */
    showRevokeModal(itemsToRevoke) {
      this.itemsToRevoke = itemsToRevoke;
      if (this.resourceIsRole) {
        this.$bvModal.show('revoke-from-role-modal');
      } else {
        this.$bvModal.show(this.revokeModalId);
      }
    },
    sortChanged(event) {
      const { sortBy, sortDesc } = event;
      this.loadData({ sortBy, sortDesc, paginationPage: 1 });
    },
  },
  watch: {
    savingStatus(status) {
      if (status === 'success') {
        this.onToggleSelectAll(false);
        this.$bvModal.hide('govCreateResourceModal');
        this.loadData();
      } else if (status === 'requestsRevoked') {
        this.onToggleSelectAll(false);
        this.$bvModal.hide(this.revokeModalId);
      } else if (status === 'resourcesRevoked') {
        this.onToggleSelectAll(false);
        this.$bvModal.hide('revoke-from-role-modal');
        this.loadData();
      }
    },
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

:deep(.checkbox-column) {
  width: 15px;
  padding-right: 0;
  vertical-align: middle;
}
</style>
