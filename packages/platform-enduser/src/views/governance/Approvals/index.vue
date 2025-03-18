<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <div class="mt-5">
      <FrHeader
        :title="$t('pageTitles.Approvals')"
        :subtitle="$t('governance.approval.subtitle')" />
      <BCard no-body>
        <FrAccessRequestList
          :list-name="$t('pageTitles.Approvals')"
          :is-loading="isLoading"
          :requests="accessRequests"
          @open-detail="viewDetails">
          <template #header>
            <FrRequestToolbar
              data-testid="approvals-toolbar"
              v-model:num-filters="numFilters"
              :sort-by-options="sortByOptions"
              :status-options="statusOptions"
              @filter-change="filterHandler({ filter: $event })"
              @sort-change="filterHandler({ sortKeys: $event })"
              @sort-direction-change="filterHandler({ sortDir: $event })"
              @status-change="filterHandler({ status: $event })" />
          </template>
          <template #no-data>
            <FrNoData
              :card="false"
              class="mb-4 border-top"
              data-testid="approvals-no-data"
              icon="inbox"
              :subtitle="$t('governance.accessRequest.noRequests', { status: getStatusText(statusOptions, status) })" />
          </template>
          <template #actions="{ item }">
            <FrRequestActionsCell
              v-if="status === 'pending'"
              :allow-self-approval="allowSelfApproval"
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
      </BCard>
    </div>
    <FrRequestModal
      :type="modalType"
      :item="modalItem"
      :require-approve-justification="requireApproveJustification"
      :require-reject-justification="requireRejectJustification"
      @modal-closed="modalType = null; modalItem = null"
      @update-item="loadItem($event)"
      @update-list="loadRequestAndUpdateBadge" />
  </BContainer>
</template>

<script>
import {
  BCard,
  BContainer,
} from 'bootstrap-vue';
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import { getUserApprovals, getRequest } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getIgaAccessRequest } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import {
  detailTypes,
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
import FrRequestToolbar from '@forgerock/platform-shared/src/components/governance/RequestToolbar';
/**
 * @description Landing page for User Approvals
 */
export default {
  name: 'Approvals',
  components: {
    BCard,
    BContainer,
    FrAccessRequestList,
    FrHeader,
    FrRequestActionsCell,
    FrRequestModal,
    FrRequestToolbar,
    FrNoData,
    FrPagination,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      REQUEST_MODAL_TYPES,
      detailTypes,
      accessRequests: [],
      currentPage: 1,
      filter: {},
      isLoading: false,
      modalItem: null,
      modalType: REQUEST_MODAL_TYPES.DETAILS,
      numFilters: 0,
      pageSize: 10,
      requireApproveJustification: false,
      requireRejectJustification: false,
      allowSelfApproval: false,
      sortByOptions,
      sortDir: 'desc',
      sortKeys: 'date',
      status: 'pending',
      statusOptions: [
        {
          text: this.$t('governance.status.pending'),
          value: 'pending',
        },
        {
          text: this.$t('governance.status.complete'),
          value: 'complete',
        },
      ],
      totalCount: 0,
    };
  },
  computed: {
    ...mapState(useUserStore, ['userId']),
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
     * Get access requests based on query params and target filter
     */
    async loadRequests(goToFirstPage) {
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
     * Update status and reload requests
     * @param {Object} status status of requests to load
     */
    handleStatusChange(status) {
      this.status = status;
      this.loadRequests();
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
      this.$router.push({ name: 'ApprovalDetails', params: { requestId: item.details.id } });
    },
    /**
     * Handles filtering requests as well as updates to pagination
     * @param {Object} property updated property
     */
    filterHandler(property) {
      const [key, value] = Object.entries(property)[0];
      this[key] = value;
      const resetPaging = (key !== 'currentPage');
      this.loadRequests(resetPaging);
    },
  },
};
</script>
<style lang="scss" scoped>
.dropdown-padding {
  padding: 0 20px;
}
.btn-outline-secondary
{
  border-color: $gray-400;
  &:hover {
    background-color: transparent;
    color: $gray;
    border-color: $gray;
  }
}
</style>
