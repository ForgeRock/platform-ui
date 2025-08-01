<!-- Copyright (c) 2023-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BContainer
      fluid="true">
      <BRow class="mx-4">
        <BCol
          class="mt-4"
          sm="12">
          <Welcome display-compact-header />
        </BCol>
      </BRow>
    </BContainer>
    <BContainer
      v-if="showRecommendations"
      fluid>
      <FrAlert
        class="w-100"
        show
        variant="warning"
        icon="info"
        :dismissible="false">
        <div>
          <span> {{ $t('pages.dashboard.recommendations.title') }}</span>
          <BButton
            class="alert-link ml-1 pb-1 p-0"
            variant="link"
            @click="goToRecommendations">
            {{ $tc('pages.dashboard.recommendations.view', recommendationsCount, { number: recommendationsCount }) }}
          </BButton>
        </div>
      </FrAlert>
    </BContainer>
    <BContainer
      fluid>
      <BRow>
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
            :count="$store.state.approvalsCount"
            :link-text="$t('pages.dashboard.cardCount.viewPendingApprovals')"
            :loading="$store.state.approvalsCount === null"
            :title="$t('pages.dashboard.cardCount.pendingApprovals')" />
        </BCol>
        <BCol lg="4">
          <FrCountCard
            class="mb-4"
            link-path="tasks"
            :count="$store.state.fulfillmentTasksCount"
            :link-text="$t('pages.dashboard.cardCount.viewPendingTasks')"
            :loading="$store.state.fulfillmentTasksCount === null"
            :title="$t('pages.dashboard.cardCount.pendingTasks')" />
        </BCol>
        <BCol lg="4">
          <FrCountCard
            class="mb-4"
            link-path="access-reviews"
            :count="$store.state.certificationCount"
            :link-text="$t('pages.dashboard.cardCount.viewAccessReviews')"
            :loading="$store.state.certificationCount === null"
            :title="$t('pages.dashboard.cardCount.accessReviews')" />
        </BCol>
        <BCol lg="4">
          <FrCountCard
            class="mb-4"
            link-path="violations"
            :count="$store.state.violationsCount"
            :link-text="$t('pages.dashboard.cardCount.viewComplianceViolations')"
            :loading="$store.state.violationsCount === null"
            :title="$t('pages.dashboard.cardCount.complianceViolations')" />
        </BCol>
      </BRow>
    </BContainer>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useUserStore } from '@forgerock/platform-shared/src/stores/user';
import { useEnduserStore } from '@forgerock/platform-shared/src/stores/enduser';
import { get } from 'lodash';
import FrCountCard from '@forgerock/platform-shared/src/components/CountCard';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { getUserRequests } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { getRequestFilter } from '@forgerock/platform-shared/src/utils/governance/AccessRequestUtils';
import Welcome from '@forgerock/platform-shared/src/enduser/components/Dashboard/widgets/WelcomeWidget';
import FrAlert from '@forgerock/platform-shared/src/components/Alert/';
import { BButton } from 'bootstrap-vue';
import { getUserRecommendations } from '@forgerock/platform-shared/src/api/governance/RecommendationsApi';

/**
 * @description Controlling component for the governance dashboard
 * @event GET
 */
export default {
  name: 'GovernanceDashboard',
  components: {
    FrCountCard,
    Welcome,
    FrAlert,
    BButton,
  },
  mixins: [NotificationMixin],
  data() {
    return {
      loadingPendingRequests: false,
      pendingRequestsCount: 0,
      recommendationsCount: 0,
      queryParams: {
        pageSize: 0,
        status: 'in-progress',
      },
    };
  },
  computed: {
    ...mapState(useUserStore, ['givenName', 'sn', 'userName', 'userId']),
    ...mapState(useEnduserStore, ['profileImage']),
    userFullName() {
      return this.$t('common.userFullName', {
        givenName: this.givenName,
        sn: this.sn,
      });
    },
    showRecommendations() {
      return this.recommendationsCount > 0;
    },
  },
  mounted() {
    this.getPendingRequestsCount();
    this.getRecommendationsCount();
  },
  methods: {
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
    async getRecommendationsCount() {
      if (this.$store.state.govAutoIdEnabled) {
        const params = {
          _pageSize: 0,
        };
        try {
          const resourceData = await getUserRecommendations(this.userId, params);
          this.recommendationsCount = get(resourceData, 'data.totalCount', 0);
        } catch (error) {
          this.showErrorMessage(error, this.$t('pages.dashboard.errorRetrievingRecommendations'));
        }
      }
    },
    goToRecommendations() {
      const currentUser = {
        id: this.userId,
        name: this.userFullName,
        profileImage: this.profileImage,
        userName: this.userName,
      };
      this.$store.commit('setRequestCartUsers', [currentUser]);
      this.$router.push({ name: 'AccessRequestRecommendedNew', params: { catalogTab: 'entitlement', returnPath: '/dashboard' } });
    },
  },
};
</script>
<style lang="scss" scoped>
  .alert-link {
    color: black;
    text-decoration: underline;
  }
</style>
