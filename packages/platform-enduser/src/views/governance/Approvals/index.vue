<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

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
          :is-loading="isLoading"
          :requests="accessRequests"
          @open-detail="openModal($event, 'DETAILS')">
          <template #header>
            <FrRequestToolbar
              data-testid="approvals-toolbar"
              :status-options="statusOptions"
              @status-change="handleStatusChange"
              @filter-change="handleFilterChange" />
          </template>
          <template #no-data>
            <FrNoData
              :card="false"
              class="mb-4 border-top"
              data-testid="approvals-no-data"
              icon="inbox"
              :subtitle="$t('governance.accessRequest.noRequests', { status })" />
          </template>
          <template #actions="{ item }">
            <div class="d-flex align-items-center justify-content-end">
              <div class="d-flex">
                <BButton
                  variant="outline-secondary"
                  size="sm"
                  class="d-none d-lg-block mx-lg-1"
                  data-testid="action-approve"
                  @click="openModal(item, 'APPROVE')">
                  <FrIcon
                    class="mr-2 text-success"
                    name="check"
                  />{{ $t('common.approve') }}
                </BButton>
                <BButton
                  variant="outline-secondary"
                  size="sm"
                  class="d-none d-lg-block mx-lg-1"
                  data-testid="action-reject"
                  @click="openModal(item, 'REJECT')">
                  <FrIcon
                    class="mr-2 text-danger"
                    name="block"
                  />{{ $t('common.reject') }}
                </BButton>
                <div class="text-right dropdown-padding">
                  <BDropdown
                    boundary="window"
                    variant="link"
                    no-caret
                    right
                    toggle-class="text-decoration-none p-0"
                    data-testid="dropdown-actions">
                    <template #button-content>
                      <FrIcon
                        class="text-muted md-24"
                        name="more_horiz"
                      />
                    </template>
                    <BDropdownItem
                      class="d-block d-lg-none"
                      @click="openModal(item, 'APPROVE')"
                      data-testid="dropdown-action-approve">
                      <FrIcon
                        class="mr-2 text-success"
                        name="check"
                      />{{ $t('common.approve') }}
                    </BDropdownItem>
                    <BDropdownItem
                      class="d-block d-lg-none"
                      data-testid="dropdown-action-reject"
                      @click="openModal(item, 'REJECT')">
                      <FrIcon
                        class="mr-2 text-danger"
                        name="block"
                      />{{ $t('common.reject') }}
                    </BDropdownItem>
                    <BDropdownDivider class="d-block d-lg-none" />
                    <BDropdownItem
                      data-testid="dropdown-action-reassign"
                      @click="openModal(item, 'REASSIGN')">
                      <FrIcon
                        name="redo"
                        class="mr-2"
                      />{{ $t('common.forward') }}
                    </BDropdownItem>
                    <BDropdownItem
                      data-testid="dropdown-action-comment"
                      @click="openModal(item, 'COMMENT')">
                      <FrIcon
                        name="chat_bubble_outline"
                        class="mr-2"
                      />{{ $t('governance.requestModal.addComment') }}
                    </BDropdownItem>
                    <BDropdownItem
                      data-testid="dropdown-action-details"
                      @click="openModal(item, 'DETAILS')">
                      <FrIcon
                        name="list_alt"
                        class="mr-2"
                      />{{ $t('common.viewDetails') }}
                    </BDropdownItem>
                  </BDropdown>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <FrPagination
              v-if="totalCount > 0"
              v-model="currentPage"
              data-testid="approvals-pagination"
              :per-page="pageSize"
              :total-rows="totalCount"
              @input="paginationChange"
              @on-page-size-change="pageSizeChange" />
          </template>
        </FrAccessRequestList>
      </BCard>
    </div>
    <FrRequestModal
      :type="modalType"
      :item="modalItem"
      :is-approvals="true"
      @modal-closed="modalType = null; modalItem = null" />
  </BContainer>
</template>

<script>
import {
  BButton,
  BDropdown,
  BDropdownItem,
  BDropdownDivider,
  BCard,
  BContainer,
} from 'bootstrap-vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrAccessRequestList from '@/components/governance/AccessRequestList';
import FrRequestToolbar from '@/components/governance/RequestToolbar';
import { getUserApprovals } from '@/api/governance/AccessRequestApi';
import FrRequestModal, { REQUEST_MODAL_TYPES } from '@/components/governance/RequestModal';

/**
 * @description Landing page for User Approvals
 */
export default {
  name: 'Approvals',
  components: {
    BButton,
    BCard,
    BContainer,
    BDropdown,
    BDropdownItem,
    BDropdownDivider,
    FrAccessRequestList,
    FrHeader,
    FrIcon,
    FrRequestModal,
    FrRequestToolbar,
    FrNoData,
    FrPagination,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      REQUEST_MODAL_TYPES,
      accessRequests: [],
      filter: {},
      currentPage: 1,
      isLoading: false,
      modalType: null,
      modalItem: null,
      pageSize: 10,
      status: this.$t('governance.status.pending'),
      statusOptions: [
        this.$t('governance.status.pending'),
        this.$t('governance.status.complete'),
      ],
      totalCount: 0,
    };
  },
  mounted() {
    this.loadRequests();
  },
  methods: {
    buildTargetFilter(filter) {
      // TODO: Implement this when integrating with API
      return filter;
    },
    /**
     * Get access requests based on query params and target filter
     */
    loadRequests() {
      this.isLoading = true;
      const payload = this.buildTargetFilter(this.filter);
      const params = {
        pageNumber: this.currentPage,
        pageSize: this.pageSize,
        status: this.status,
      };

      getUserApprovals(this.$store.state.UserStore.userId, params, payload).then(({ data }) => {
        this.accessRequests = data.results;
        this.totalCount = data.totalCount;
      }).catch((error) => {
        this.accessRequests = [];
        this.totalCount = 0;
        this.showErrorMessage(error, this.$t('governance.approval.errorGettingApprovals'));
      }).finally(() => {
        this.isLoading = false;
      });
    },
    /**
     * Update filter and reload requests
     * @param {Object} filter filter to apply to requests
     */
    handleFilterChange(filter) {
      this.filter = filter;
      this.loadRequests();
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
     * Open Modal for respective Item and type of action
     * @param {Object} item item the user is willing to request an action for
     * @param {String} type type of requests
     */
    openModal(item, type = 'DETAILS') {
      this.modalItem = item;
      this.modalType = REQUEST_MODAL_TYPES[type];
      this.$bvModal.show('request_modal');
    },
    /**
     * Update page and reload requests
     * @param {Number} pageNumber current page
     */
    paginationChange(pageNumber) {
      this.currentPage = pageNumber;
      this.loadRequests();
    },
    /**
     * Update page size and reload requests
     * @param {Number} pageSize current page size
     */
    pageSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.loadRequests();
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
