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
          :requests="accessRequests">
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
  </BContainer>
</template>

<script>
import {
  BCard,
  BContainer,
} from 'bootstrap-vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrAccessRequestList from '@/components/governance/AccessRequestList';
import FrRequestToolbar from '@/components/governance/RequestToolbar';
import { getUserApprovals } from '@/api/governance/AccessRequestApi';

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
    FrRequestToolbar,
    FrNoData,
    FrPagination,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      accessRequests: [],
      filter: {},
      currentPage: 1,
      isLoading: false,
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
