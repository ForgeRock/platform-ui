<!-- Copyright 2023 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <BRow>
      <BCol
        class="mb-4"
        lg="4"
      >
        <FrVisualizationCard
          :count="activeCampaigns ? activeCampaigns : '0'"
          :loading="isLoadingActiveCampaigns"
          :title="$t('governance.certification.activeCampaigns')"
          :tooltip="$t('governance.certification.activeCampaignsTooltip')" />
      </BCol>
      <BCol
        class="mb-4"
        lg="4"
      >
        <FrVisualizationCard
          :count="expiringCampaigns ? expiringCampaigns : '0'"
          :loading="isLoadingExpiringCampaigns"
          :title="$t('governance.certification.expiringCampaigns')"
          :tooltip="$t('governance.certification.expiringCampaignsTooltip')" />
      </BCol>
      <BCol
        class="mb-4"
        lg="4"
      >
        <FrVisualizationCard
          :count="activeReviews ? activeReviews : '0'"
          :loading="isLoadingActiveReviews"
          :title="$t('governance.certification.activeReviews')"
          :tooltip="$t('governance.certification.activeReviewsTooltip')" />
      </BCol>
    </BRow>
    <BRow class="align-items-stretch">
      <BCol
        v-if="campaignsByType && campaignsByType.length > 0"
        class="mb-4"
        lg="4"
      >
        <FrVisualizationCard
          class="h-100"
          :loading="isLoadingCampaignsByType"
          :title="$t('governance.certification.campaignsByType')"
        >
          <template #chart>
            <FrPieChart
              id="type-pie-chart"
              :height="120"
              :radius="50"
              :data="campaignsByType"
              :stroke-width="1"
              :width="120"
            />
          </template>
        </FrVisualizationCard>
      </BCol>
      <BCol
        v-if="campaignsByStatus && campaignsByStatus.length > 0"
        class="mb-4"
        lg="4"
      >
        <FrVisualizationCard
          class="h-100"
          :loading="isLoadingCampaignsByStatus"
          :title="$t('governance.certification.campaignsByStatus')"
        >
          <template #chart>
            <FrPieChart
              id="status-pie-chart"
              :height="120"
              :radius="50"
              :data="campaignsByStatus"
              :stroke-width="1"
              :width="120"
            />
          </template>
        </FrVisualizationCard>
      </BCol>
      <BCol
        v-if="accessReviewHistory && accessReviewHistory.length > 0"
        class="mb-4"
        lg="4"
      >
        <FrVisualizationCard
          class="h-100"
          :loading="isLoadingAccessReviewHistory"
          :title="$t('governance.certification.accessReviewHistory')"
        >
          <template #chart>
            <FrPieChart
              id="history-pie-chart"
              :height="120"
              :radius="50"
              :data="accessReviewHistory"
              :stroke-width="1"
              :width="120"
            />
          </template>
        </FrVisualizationCard>
      </BCol>
    </BRow>
  </div>
</template>

<script>

import {
  BCol,
  BRow,
} from 'bootstrap-vue';
import FrPieChart from '@forgerock/platform-shared/src/components/Visualization/Charts/PieChart';
import FrVisualizationCard from '@forgerock/platform-shared/src/components/Visualization/VisualizationCard';
import {
  getAccessReviewHistory,
  getActiveReviews,
} from '@forgerock/platform-shared/src/api/governance/AccessReviewApi';
import {
  getActiveCampaignsCount,
  getCampaignsByStatus,
  getCampaignsByType,
  getExpiringCampaigns,
} from '@forgerock/platform-shared/src/api/governance/CampaignApi';
/*
 * @description view to show an overview for certifications, it shows number of active campaigns, number of expiring
 * campaigns, number of active reviews. Also it displays info on pie charts for campaigns by type, campaigns by status,
 * access review history
 */
export default {
  name: 'Overview',
  components: {
    BCol,
    BRow,
    FrPieChart,
    FrVisualizationCard,
  },
  data() {
    return {
      accessReviewHistory: null,
      activeCampaigns: null,
      activeReviews: null,
      campaignsByStatus: null,
      campaignsByType: null,
      expiringCampaigns: null,
      isLoadingAccessReviewHistory: true,
      isLoadingActiveCampaigns: true,
      isLoadingActiveReviews: true,
      isLoadingCampaignsByStatus: true,
      isLoadingCampaignsByType: true,
      isLoadingExpiringCampaigns: true,
    };
  },
  methods: {
    getData() {
      getActiveCampaignsCount().then((count) => {
        this.activeCampaigns = count;
      }).finally(() => {
        this.isLoadingActiveCampaigns = false;
      });

      getCampaignsByType().then((campaignsByType) => {
        this.campaignsByType = campaignsByType;
      }).finally(() => {
        this.isLoadingCampaignsByType = false;
      });

      getExpiringCampaigns().then((count) => {
        this.expiringCampaigns = count;
      }).finally(() => {
        this.isLoadingExpiringCampaigns = false;
      });

      getActiveReviews().then((count) => {
        this.activeReviews = count;
      }).finally(() => {
        this.isLoadingActiveReviews = false;
      });

      getCampaignsByStatus().then((campaignsByStatus) => {
        this.campaignsByStatus = campaignsByStatus;
      }).finally(() => {
        this.isLoadingCampaignsByStatus = false;
      });

      getAccessReviewHistory().then((accessReviewHistory) => {
        this.accessReviewHistory = accessReviewHistory;
      }).finally(() => {
        this.isLoadingAccessReviewHistory = false;
      });
    },
  },
  mounted() {
    this.getData();
  },
};
</script>
