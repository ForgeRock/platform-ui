<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BContainer fluid="true">
      <BRow class="mx-4">
        <BCol
          class="mt-4"
          sm="12">
          <Welcome
            display-compact-header
            :user-details="userDetails" />
        </BCol>
      </BRow>
    </BContainer>
    <BContainer>
      <BRow>
        <BCol lg="4">
          <FrCountCard
            class="mb-4"
            link-path="access-reviews"
            :count="accessReviewsCount"
            :link-text="$t('pages.dashboard.cardCount.viewAccessReviews')"
            :loading="loadingAccessReviews"
            :title="$t('pages.dashboard.cardCount.accessReviews')" />
        </BCol>
        <BCol lg="4">
          <FrCountCard
            class="mb-4"
            link-path="my-requests"
            :count="pendingRequestsCount"
            :link-text="$t('pages.dashboard.cardCount.viewPendingRequests')"
            :loading="loadingPendingRequests"
            :title="$t('pages.dashboard.cardCount.pendingRequests')" />
        </BCol>
        <BCol lg="4">
          <FrCountCard
            class="mb-4"
            link-path="approvals"
            :count="pendingApprovalsCount"
            :link-text="$t('pages.dashboard.cardCount.viewPendingApprovals')"
            :loading="loadingPendingApprovals"
            :title="$t('pages.dashboard.cardCount.pendingApprovals')" />
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { get } from 'lodash';

import FrCountCard from '@forgerock/platform-shared/src/components/CountCard';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import Welcome from '@/views/DashboardManager/dashboards/widgets/WelcomeWidget';
import { getCertificationItems } from '@/api/governance/AccessReviewApi';
import { getRequestFilter } from '@/components/utils/governance/AccessRequestUtils';
import { getUserRequests, getUserApprovals } from '@/api/governance/AccessRequestApi';

/**
 * @description Controlling component for the governance dashboard
 * @event GET
 */
export default {
  name: 'GovernanceDashboard',
  components: {
    FrCountCard,
    Welcome,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      accessReviewsCount: 0,
      loadingAccessReviews: false,
      loadingPendingApprovals: false,
      loadingPendingRequests: false,
      pendingApprovalsCount: 0,
      pendingRequestsCount: 0,
      queryParams: {
        pageSize: 0,
        status: 'in-progress',
      },
    };
  },
  computed: {
    ...mapState({
      userDetails: (state) => state.UserStore,
      userId: (state) => state.UserStore.userId,
    }),
  },
  mounted() {
    this.getAccessReviewsCount();
    this.getPendingRequestsCount();
    this.getPendingApprovalsCount();
  },
  methods: {
    /**
     * Performs API call to get total access reviews
     * @returns {Void}
     * */
    getAccessReviewsCount() {
      this.loadingAccessReviews = true;
      getCertificationItems({ status: 'active' })
        .then((resourceData) => {
          this.accessReviewsCount = get(resourceData, 'data.totalCount', 0);
          this.$store.commit('setCertificationCount', this.accessReviewsCount);
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('pages.dashboard.errorRetrievingAccesReviews'));
        })
        .finally(() => {
          this.loadingAccessReviews = false;
        });
    },
    getPendingRequestsCount() {
      this.loadingPendingRequests = true;

      const filter = getRequestFilter({}, 'in-progress');

      getUserRequests(this.userId, this.queryParams, filter)
        .then((resourceData) => {
          this.pendingRequestsCount = get(resourceData, 'data.totalCount', 0) || 0;
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('pages.dashboard.errorRetrievingPendingRequests'));
        })
        .finally(() => {
          this.loadingPendingRequests = false;
        });
    },
    getPendingApprovalsCount() {
      this.loadingPendingApprovals = true;

      const params = {
        pageSize: 0,
        actorStatus: 'active',
      };

      getUserApprovals(this.userId, params)
        .then((resourceData) => {
          this.pendingApprovalsCount = get(resourceData, 'data.totalCount', 0) || 0;
          this.$store.commit('setApprovalsCount', this.pendingApprovalsCount);
        })
        .catch((error) => {
          this.showErrorMessage(error, this.$t('pages.dashboard.errorRetrievingPendingApprovals'));
        })
        .finally(() => {
          this.loadingPendingApprovals = false;
        });
    },
  },
};
</script>
