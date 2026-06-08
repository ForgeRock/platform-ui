<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-column h-100 w-100 px-4 pt-5">
    <FrHeader
      :title="$t('pageTitles.Approvals')"
      :subtitle="$t('governance.approval.subtitle')" />
    <div class="d-flex flex-wrap flex-grow-1 w-100">
      <FrFilterSidePanel
        v-if="showFilters"
        :title="$t('governance.access.filter.requestFilter')">
        <FrAccessFilter
          :input-fields="accessFilter"
          :input-filter-data="filterData"
        />
      </FrFilterSidePanel>
      <div class="d-flex h-100 table-container fr-table-panel">
        <BCard
          class="h-100 d-flex"
          no-body>
          <div class="d-flex flex-grow-1 table-container">
            <FrAccessRequestList
              :list-name="$t('pageTitles.Approvals')"
              :is-loading="isLoading"
              :requests="accessRequests"
              :auto-id-settings="autoIdSettings"
              :schema="schema"
              @open-detail="viewDetails">
              <template #header>
                <BButtonToolbar
                  class="px-4 py-3 border-bottom-0 justify-content-end">
                  <FrSortDropdown
                    class="px-3"
                    :selected-item="sortField"
                    :hide-labels-on-mobile="true"
                    :sort-by-options="sortByOptions"
                    @sort-field-change="handleSortChange"
                    @sort-direction-change="handleSortDirectionChange" />
                  <BButton
                    @click="showFilters = !showFilters"
                    class="toolbar-link-text"
                    :pressed="showFilters"
                    aria-labelledby="filter-toggle-label"
                    data-testid="filter-toggle"
                    variant="link">
                    <FrIcon
                      icon-class="mr-lg-2"
                      name="filter_list">
                      <span
                        class="d-none d-lg-inline"
                        id="filter-toggle-label">
                        {{ showFilters ? $t('governance.toolbar.hideFilters') : $t('governance.toolbar.showFilters') }}
                      </span>
                    </FrIcon>
                    <BBadge
                      v-if="numFilters > 0"
                      pill
                      class="ml-1"
                      data-testid="filter-badge"
                      variant="primary">
                      {{ numFilters }}
                    </BBadge>
                  </BButton>
                </BButtonToolbar>
                <!-- Visually hidden live region for screen readers -->
                <div
                  v-if="activeQuery"
                  role="alert"
                  aria-live="assertive"
                  class="sr-only">
                  {{ resultCountMessage }}
                </div>
              </template>
              <template #no-data>
                <FrNoData
                  :card="false"
                  class="mb-4 border-top"
                  data-testid="approvals-no-data"
                  icon="inbox"
                  :subtitle="noDataMessage" />
              </template>
              <template #actions="{ item }">
                <FrRequestActionsCell
                  v-if="status === 'pending'"
                  :allow-self-approval="allowSelfApproval"
                  :status="status"
                  :item="item"
                  :type="detailTypes.APPROVAL"
                  @action="handleAction($event, item)" />
              </template>
              <template #footer>
                <FrPagination
                  v-if="totalCount > 0"
                  v-model="currentPage"
                  data-testid="approvals-pagination"
                  :per-page="pageSize"
                  :total-rows="totalCount"
                  @input="filterHandler({ currentPage: $event })"
                  @on-page-size-change="filterHandler({ pageSize: $event })" />
              </template>
            </FrAccessRequestList>
          </div>
        </BCard>
      </div>
    </div>
    <FrRequestModal
      :type="modalType"
      :item="modalItem"
      :require-approve-justification="requireApproveJustification"
      :require-reject-justification="requireRejectJustification"
      @modal-closed="modalType = null; modalItem = null"
      @update-item="loadItem($event)"
      @update-list="loadRequestAndUpdateBadge" />
  </div>
</template>

<script>
import {
  BCard,
  BButton,
  BButtonToolbar,
  BBadge,
  BFormRadioGroup,
} from 'bootstrap-vue';
import { debounce } from 'lodash';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import { getUserApprovals, getRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getIgaAccessRequest, getFilterSchema } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import {
  detailTypes,
  getAccessFilterConfig,
  getInitialRequestFilterData,
  getNumFilters,
  getRequestFilter,
  getStatusText,
  sortByOptions,
  sortKeysMap,
  getFormattedRequest,
  getRequestTypeDisplayNames,
} from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import { REQUEST_MODAL_TYPES } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrRequestActionsCell from '@forgerock/platform-shared/src/components/governance/RequestDetails/RequestActionsCell';
import FrRequestModal from '@forgerock/platform-shared/src/components/governance/RequestModal/RequestModal';
import FrAccessRequestList from '@forgerock/platform-shared/src/components/governance/AccessRequestList';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrSortDropdown from '@forgerock/platform-shared/src/components/governance/SortDropdown';
import FrFilterSidePanel from '@forgerock/platform-shared/src/components/governance/FilterSidePanel';
import FrAccessFilter from '@forgerock/platform-shared/src/components/governance/AccessFilter/AccessFilter';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrSelectInput from '@forgerock/platform-shared/src/components/Field/SelectInput';
import FrPriorityFilter from '@forgerock/platform-shared/src/components/governance/PriorityFilter';

/**
 * @description Landing page for User Approvals
 */
export default {
  name: 'Approvals',
  components: {
    BCard,
    FrAccessRequestList,
    FrHeader,
    FrRequestActionsCell,
    FrRequestModal,
    FrNoData,
    FrPagination,
    BButton,
    BButtonToolbar,
    BBadge,
    FrIcon,
    FrSortDropdown,
    FrFilterSidePanel,
    FrAccessFilter,
  },
  mixins: [NotificationMixin],
  data() {
    const statusOptions = [
      {
        text: this.$t('governance.status.pending'),
        value: 'pending',
      },
      {
        text: this.$t('governance.status.complete'),
        value: 'complete',
      },
    ];
    const filterData = getInitialRequestFilterData(statusOptions[0].value);
    const accessFilter = getAccessFilterConfig(
      {
        BFormRadioGroup,
        FrPriorityFilter,
        FrSelectInput,
        FrField,
        FrGovResourceSelect,
      },
      {
        statusOptions,
        filterData,
      },
    );

    return {
      REQUEST_MODAL_TYPES,
      detailTypes,
      accessRequests: [],
      accessFilter,
      activeQuery: false,
      currentPage: 1,
      filter: {},
      filterData,
      isLoading: false,
      modalItem: null,
      modalType: REQUEST_MODAL_TYPES.DETAILS,
      pageSize: 10,
      requireApproveJustification: false,
      requireRejectJustification: false,
      allowSelfApproval: false,
      schema: {
        user: [],
      },
      showFilters: false,
      sortByOptions,
      sortDir: 'desc',
      sortField: 'date',
      sortKeys: 'date',
      status: 'pending',
      statusOptions,
      totalCount: 0,
    };
  },
  computed: {
    ...mapState(useUserStore, ['userId']),
    noDataMessage() {
      return this.$t('governance.accessRequest.noRequests', { status: getStatusText(this.statusOptions, this.status) });
    },
    resultCountMessage() {
      return !this.totalCount
        ? this.noDataMessage
        : this.$t('common.numberElementsFound', {
          number: this.totalCount,
          element: this.totalCount === 1 ? this.$t('common.approval') : this.$t('common.approvals'),
        });
    },
    autoIdSettings() {
      return this.$store.state.govAutoIdSettings;
    },
    numFilters() {
      return getNumFilters(this.filterData);
    },
  },
  watch: {
    filterData: {
      deep: true,
      handler: debounce(function syncFilterData() {
        const {
          status: statusField,
          priorities,
          requestType,
          query,
          requester,
          user,
        } = this.filterData;
        this.status = statusField.value;
        this.filter = {
          priorities: priorities.value,
          requestType: requestType.value !== 'all' ? requestType.value : null,
          query: query.value || null,
          requester: requester.value || null,
          user: user.value || null,
        };
        this.loadRequests(true, true);
      }, 300),
    },
  },
  async mounted() {
    this.loadRequestAndUpdateBadge();
    try {
      const { data } = await getIgaAccessRequest();
      this.requireApproveJustification = data.requireApproveJustification;
      this.requireRejectJustification = data.requireRejectJustification;
      this.allowSelfApproval = data.allowSelfApproval;
    } catch {
      // We don't need to show an error here
    }

    try {
      const { data } = await getFilterSchema();
      this.schema.user = data.user;
    } catch {
      // We don't need to show an error here
    }
  },
  methods: {
    getStatusText,
    loadRequestAndUpdateBadge() {
      this.loadRequests();
      this.updateBadge();
    },
    async updateBadge() {
      const queryParams = {
        pageSize: 0,
        actorStatus: 'active',
      };
      try {
        const { data } = await getUserApprovals(this.userId, queryParams);
        this.$store.commit('setApprovalsCount', data.totalCount);
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.approval.errorGettingPendingApprovals'));
      }
    },
    /**
     * Update current item being displayed on the modal
     */
    async loadItem(id) {
      try {
        const updatedItem = await getRequest(id);
        if (this.accessRequests) {
          const index = this.accessRequests.findIndex((request) => request.id === id);
          this.$set(this.accessRequests, index, updatedItem.data);

          const newItem = getFormattedRequest(updatedItem.data);
          this.modalItem = newItem;
        }
      } catch (error) {
        this.showErrorMessage(error, this.$t('governance.approval.errorGettingUpdatedItem'));
      }
    },
    /**
     * Loads access requests for the current user based on active filters, pagination, and sort settings.
     * @param {boolean} goToFirstPage If true, resets pagination to the first page before loading requests.
     * @param {boolean} loadFromFilter If true, indicates the data is being loaded from a filter change.
     */
    async loadRequests(goToFirstPage, loadFromFilter) {
      this.isLoading = true;

      if (goToFirstPage) this.currentPage = 1;

      const payload = getRequestFilter(this.filter);
      const params = {
        _pagedResultsOffset: (this.currentPage - 1) * this.pageSize,
        _pageSize: this.pageSize,
        _sortKeys: sortKeysMap[this.sortKeys],
        _sortDir: this.sortDir,
        actorStatus: this.status === 'pending' ? 'active' : 'inactive',
      };

      if (this.sortKeys === 'date') params._sortType = 'date';

      try {
        const { data } = await getUserApprovals(this.userId, params, payload);
        this.accessRequests = await getRequestTypeDisplayNames(data.result);
        this.totalCount = data.totalCount;
      } catch (error) {
        this.accessRequests = [];
        this.totalCount = 0;
        this.showErrorMessage(error, this.$t('governance.approval.errorGettingApprovals'));
      } finally {
        this.isLoading = false;
        this.activeQuery = loadFromFilter;
      }
    },
    /**
     * Handles the specified action for a given item.
     * @param {string} action - The action to be performed.
     * @param {Object} item - The item on which the action is to be performed.
     */
    handleAction(action, item) {
      if (action === 'DETAILS') this.viewDetails(item);
      else this.openModal(item, action);
    },
    /**
     * Opens the request / cancel modals
     * @param {Object} item request item that was clicked
     * @param {String} type string that tells the modal what view to show
     */
    openModal(item, type) {
      this.modalItem = item;
      this.modalType = REQUEST_MODAL_TYPES[type];
      this.$bvModal.show('request_modal');
    },
    /**
     * Navigates to the detail view of the selected item.
     * @param {Object} item - The item to view.
     */
    viewDetails(item) {
      this.$router.push({ name: 'ApprovalDetails', params: { requestId: item.details.id, status: this.status === 'pending' ? 'active' : this.status } });
    },
    /**
     * Handles filtering requests as well as updates to pagination
     * @param {Object} property updated property
     * @param {Boolean} loadFromFilter - Optional flag (default false) to indicate if the load is triggered by a search filter in the component
     */
    filterHandler(property, loadFromFilter = false) {
      const [key, value] = Object.entries(property)[0];
      this[key] = value;
      const resetPaging = (key !== 'currentPage');
      this.loadRequests(resetPaging, loadFromFilter);
    },
    /**
     * Updates the active sort field and reloads the approvals list.
     * @param {string} field - The sort field key selected by the user.
     */
    handleSortChange(field) {
      this.sortField = field;
      this.filterHandler({ sortKeys: field });
    },
    /**
     * Updates the active sort direction and reloads the approvals list.
     * @param {string} direction - The sort direction ('asc' or 'desc').
     */
    handleSortDirectionChange(direction) {
      this.filterHandler({ sortDir: direction });
    },
  },
};
</script>
<style lang="scss" scoped>
.table-container {
  flex: 1 1 auto;
  min-width: 0 !important;
  min-height: 300px;

  :deep(> div) {
    width: 100%;
  }
}

.fr-table-panel {
  flex: 1 1 0;
  min-width: 0;
}
.toolbar-link-text {
  color: $gray-900;
}
</style>
