<!-- Copyright 2023-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BContainer
    fluid>
    <div class="mt-5">
      <FrHeader
        class="mb-4"
        data-testid="header"
        :title="campaignDetails && campaignDetails.name"
        :top-text="campaignDetails && $t(`governance.editTemplate.templateType.${campaignDetails.certificationType}`)"
      />
      <BTabs
        content-class="mt-3"
        nav-class="fr-tabs"
        v-model="tabIndex"
        data-testid="cert-tabs"
        @activate-tab="selectTab">
        <BTab
          data-testid="overview-tab"
          key="overview"
          :active="tabIndex === 0"
          :title="$t('governance.certificationDetails.detailsTabTitle')"
        >
          <FrCampaignOverview
            data-testid="campaign-overview"
            v-if="campaignDetails"
            :campaign="campaignDetails"
            @update:status="campaignDetails.status = $event"
          />
        </BTab>
        <BTab
          data-testid="access-reviews-tab"
          key="accessReviews"
          lazy
          :title="$t('governance.certificationDetails.accessReviewsTabTitle')"
        >
          <FrAccessReviews
            :campaign-id="$route.params.campaignId"
            :campaign-status="campaignDetails && campaignDetails.status" />
        </BTab>
      </BTabs>
    </div>
  </BContainer>
</template>

<script>
import {
  BContainer,
  BTabs,
  BTab,
} from 'bootstrap-vue';
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import { getCampaignDetails } from '@forgerock/platform-shared/src/api/governance/CampaignApi';
import FrCampaignOverview from './CampaignOverview';
import FrAccessReviews from './AccessReviews';

export default {
  name: 'CampaignDetails',
  components: {
    BContainer,
    BTabs,
    BTab,
    FrAccessReviews,
    FrCampaignOverview,
    FrHeader,
  },
  setup() {
    const { setBreadcrumb } = useBreadcrumb();
    return { setBreadcrumb };
  },
  data() {
    return {
      tabIndex: 0,
      campaignDetails: null,
      tabs: ['details', 'access-reviews'],
    };
  },
  created() {
    this.tabIndex = this.tabs.findIndex((key) => key === this.$route.params.tab);
  },
  mounted() {
    this.setBreadcrumb('/certification/campaigns', this.$t('governance.certification.title'));

    getCampaignDetails(this.$route.params.campaignId).then((campaignDetails) => {
      this.campaignDetails = campaignDetails;
    });
  },
  beforeRouteUpdate(to, from, next) {
    // This is needed to be able to listen changes in router params when the router single page is already rendered
    if (to.params.tab !== from.params.tab) {
      this.handleRouteUpdate(to.params.tab);
    }
    next();
  },
  methods: {
    handleRouteUpdate(tab) {
      this.tabIndex = this.tabs.findIndex((key) => key === tab);
      this.selectTab(this.tabIndex);
    },
    selectTab(newTabIndex) {
      if (newTabIndex > -1) {
        const tab = this.tabs[newTabIndex];
        this.$route.params.tab = tab;
        window.history.replaceState(window.history.state, '', `#/certification/campaigns/${this.campaignDetails.id}/${tab}`);
      }
    },
  },
};
</script>
