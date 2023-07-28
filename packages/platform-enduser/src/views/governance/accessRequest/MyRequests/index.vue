<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BContainer>
      <BRow class="mt-5 pb-4 pb-lg-0 align-items-center">
        <BCol lg="8">
          <FrHeader
            :title="$t('pageTitles.MyRequests')"
            :subtitle="$t('pages.myRequests.subTitle')" />
        </BCol>
        <BCol lg="4">
          <div class="d-flex justify-content-lg-end">
            <BButton
              variant="primary"
              :aria-label="$t('governance.accessRequest.newRequest.newRequest')"
              @click="newRequest">
              <FrIcon
                class="mr-2"
                name="add" />{{ $t('governance.accessRequest.newRequest.newRequest') }}
            </BButton>
          </div>
        </BCol>
      </BRow>
      <BRow>
        <BCol>
          <BCard no-body>
            <FrAccessRequestList
              :is-loading="isLoading"
              :requests="accessRequests"
              @open-detail="openModal($event, 'DETAILS')">
              <template #header>
                <FrRequestToolbar
                  :status-options="statusOptions"
                  @filter-change="filterHandler({ filter: $event })"
                  @sort-change="filterHandler({ sortKeys: $event })"
                  @sort-direction-change="filterHandler({ sortDir: $event })"
                  @status-change="filterHandler({ status: $event })" />
              </template>
              <template #no-data>
                <FrNoData
                  class="mb-4 border-top"
                  data-testid="requests-no-data"
                  icon="person_add"
                  :card="false"
                  :subtitle="$t('governance.accessRequest.noRequests', { status: getStatusText(statusOptions, status) })" />
              </template>
              <template #actions="{ item }">
                <div class="d-flex justify-content-end align-items-center">
                  <div class="d-none d-lg-block mr-4">
                    <BBadge
                      class="badge-status font-weight-normal"
                      data-testid="status-badge"
                      :variant="status === 'complete' ? 'success' : 'light'">
                      {{ getStatusText(statusOptions, status) }}
                    </BBadge>
                  </div>
                  <FrActionsCell
                    test-id="cell-button"
                    :delete-option="false"
                    :divider="false"
                    :edit-option="false">
                    <template #custom-top-actions>
                      <BDropdownItem @click="openModal(item, 'COMMENT')">
                        <FrIcon
                          class="mr-3"
                          name="chat_bubble_outline" />
                        {{ $t('governance.certificationTask.actions.addComment') }}
                      </BDropdownItem>
                      <BDropdownItem
                        data-testid="view-details-button"
                        @click="openModal(item, 'DETAILS')">
                        <FrIcon
                          class="mr-3"
                          name="list_alt" />
                        {{ $t('common.viewDetails') }}
                      </BDropdownItem>
                      <BDropdownDivider />
                      <BDropdownItem @click="openModal(item, 'CANCEL')">
                        <FrIcon
                          class="mr-2"
                          name="cancel" />
                        {{ $t('governance.accessRequest.myRequests.cancelRequest') }}
                      </Bdropdownitem>
                    </template>
                  </FrActionsCell>
                </div>
              </template>
            </FrAccessRequestList>
            <FrPagination
              v-model="currentPage"
              :per-page="pageSize"
              :total-rows="totalRows"
              @input="filterHandler({ currentPage: $event })"
              @on-page-size-change="filterHandler({ pageSize: $event })" />
          </BCard>
        </BCol>
      </Brow>
    </BContainer>
    <FrRequestModal
      :type="modalType"
      :item="modalItem"
      :is-my-requests="true"
      @modal-closed="modalType = null; modalItem = null"
      @modal-success="loadRequests"
    />
    <FrNewRequestModal />
  </div>
</template>

<script>
import {
  BBadge,
  BButton,
  BCard,
  BCol,
  BContainer,
  BDropdownDivider,
  BDropdownItem,
  BRow,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import CertificationMixin from '@forgerock/platform-shared/src/mixins/Governance/Certification';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrAccessRequestList from '@/components/governance/AccessRequestList';
import FrRequestToolbar from '@/components/governance/RequestToolbar';
import { getRequestFilter, getStatusText, sortKeysMap } from '@/components/utils/governance/AccessRequestUtils';
import { getUserRequests } from '@/api/governance/AccessRequestApi';
import FrRequestModal, { REQUEST_MODAL_TYPES } from '@/components/governance/RequestModal';
import FrNewRequestModal from '@/components/governance/NewRequestModal';
/**
 * View new access request items
 */
export default {
  name: 'MyRequests',
  components: {
    BBadge,
    BButton,
    BCard,
    BCol,
    BContainer,
    BDropdownDivider,
    BDropdownItem,
    BRow,
    FrAccessRequestList,
    FrActionsCell,
    FrHeader,
    FrIcon,
    FrNewRequestModal,
    FrNoData,
    FrPagination,
    FrRequestModal,
    FrRequestToolbar,
  },
  mixins: [
    CertificationMixin,
    NotificationMixin,
  ],
  data() {
    return {
      accessRequests: [],
      currentPage: 1,
      filter: {},
      isLoading: false,
      modalItem: {},
      modalType: 'REQUEST_MODAL_TYPES.DETAILS',
      pageSize: 10,
      sortDir: 'desc',
      sortKeys: 'date',
      status: 'in-progress',
      statusOptions: [
        {
          text: this.$t('governance.status.pending'),
          value: 'in-progress',
        },
        {
          text: this.$t('governance.status.complete'),
          value: 'complete',
        },
        {
          text: this.$t('governance.status.canceled'),
          value: 'cancelled',
        },
      ],
      totalRows: 0,
    };
  },
  mounted() {
    this.loadRequests();
  },
  methods: {
    getStatusText,
    /**
     * Get current users access requests based on query params and target filter
     */
    async loadRequests(goToFirstPage) {
      this.isLoading = true;

      if (goToFirstPage) this.currentPage = 1;

      const payload = getRequestFilter(this.filter, this.status);
      const params = {
        pagedResultsOffset: (this.currentPage - 1) * this.pageSize,
        pageSize: this.pageSize,
        sortKeys: sortKeysMap[this.sortKeys],
        sortDir: this.sortDir,
      };

      if (this.sortKeys === 'date') params.sortType = 'date';

      try {
        const { data } = await getUserRequests(this.$store.state.UserStore.userId, params, payload);
        this.accessRequests = data.result;
        this.totalRows = data.totalCount;
      } catch (error) {
        this.accessRequests = [];
        this.totalRows = 0;
        this.showErrorMessage(error, this.$t('governance.accessRequest.myRequests.errorGettingRequests'));
      } finally {
        this.isLoading = false;
      }
    },
    newRequest() {
      this.$root.$emit('bv::show::modal', 'NewRequestModal');
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
.badge-status {
  width: 100px;
}
</style>
