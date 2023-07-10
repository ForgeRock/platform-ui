<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer>
    <div class="mt-5">
      <FrHeader
        :title="$t('pageTitles.Approvals')"
        :subtitle="$t('governance.approval.subtitle')" />
      <BCard
        no-body>
        <FrRequestToolbar
          :status-options="statusOptions"
          @status-change="handleStatusChange"
          @filter-change="handleFilterChange" />
        <FrAccessRequestList
          :requests="accessRequests" />
      </BCard>
    </div>
  </BContainer>
</template>

<script>
import {
  BCard,
  BContainer,
} from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
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
  },
  data() {
    return {
      accessRequests: [],
      filter: {},
      pageNumber: 1,
      pageSize: 10,
      status: this.$t('governance.status.pending'),
      statusOptions: [
        this.$t('governance.status.pending'),
        this.$t('governance.status.complete'),
      ],
    };
  },
  mounted() {
    getUserApprovals(null, { pageSize: 10, pageNumber: 1 }).then(({ data }) => {
      this.accessRequests = data.results;
    });
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
      const payload = this.buildTargetFilter(this.filter);
      const params = {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        status: this.status,
      };

      getUserApprovals(null, params, payload).then(({ data }) => {
        this.accessRequests = data.results;
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
     * Update status and reulad requests
     * @param {Object} status status of requests to load
     */
    handleStatusChange(status) {
      this.status = status;
      this.loadRequests();
    },
  },
};
</script>
