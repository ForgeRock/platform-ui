<!-- Copyright 2023-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <BContainer
    fluid>
    <div class="mt-5">
      <FrHeader
        :title="$t('governance.certification.title')"
        :subtitle="$t('governance.certification.subtitle')" />
      <BTabs
        content-class="mt-3"
        nav-class="fr-tabs"
        v-model="tabIndex"
        data-testid="cert-tabs"
        @activate-tab="tabActivated">
        <BTab
          :title="$t('governance.certification.overview')"
          key="overview"
          :active="tabIndex === 0"
          lazy>
          <FrOverview data-testid="cert-overview" />
        </BTab>
        <BTab
          :title="$t('governance.certification.campaigns')"
          key="campaigns"
          lazy>
          <FrCampaigns data-testid="cert-campaigns" />
        </BTab>
        <BTab
          :title="$t('governance.templates.title')"
          key="template"
          lazy>
          <FrTemplates data-testid="cert-template" />
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
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
import FrCampaigns from './Campaigns';
import FrOverview from './Overview';
import FrTemplates from './Templates';

export default {
  name: 'Certification',
  components: {
    BContainer,
    BTabs,
    BTab,
    FrCampaigns,
    FrHeader,
    FrOverview,
    FrTemplates,
  },
  data() {
    return {
      tabIndex: 0,
      tabMap: [
        'overview', 'campaigns', 'templates',
      ],
    };
  },
  created() {
    const tabIndex = this.tabMap.findIndex((key) => key === this.$route.params.certificationTab);
    this.tabIndex = tabIndex !== -1 ? tabIndex : 0;
    const certificationTab = this.tabMap[this.tabIndex];
    window.history.pushState(window.history.state, '', `#/certification/${certificationTab}`);
  },
  methods: {
    /**
     * Sets the routing url
     * @param {number} tabIndex - currently selected tab index
     */
    tabActivated(tabIndex) {
      const certificationTab = this.tabMap[tabIndex];
      window.history.pushState(window.history.state, '', `#/certification/${certificationTab}`);
    },
  },
};
</script>
