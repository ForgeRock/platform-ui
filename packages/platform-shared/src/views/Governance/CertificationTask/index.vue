<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="certification-task-container">
    <template v-if="!loadFailed">
      <FrCertificationTaskHeader
        :actor-id="actorId"
        :campaign-details="campaignDetails"
        :hide-sign-off="hideSignOff"
        :is-complete="isComplete"
        :is-saving="isSaving"
        @change-saving="setSaving"
        @review-forwarded="goToBackUrl"
        @sign-off="signOff" />
      <FrCertificationTaskDetails
        :totals="totals"
        :campaign-details="campaignDetails"
        :is-loading="isDetailsLoading" />
      <FrCertificationTaskList
        class="border-top"
        v-if="campaignId && actorId"
        :campaign-id="campaignId"
        :campaign-details="campaignDetails"
        :refresh-tasks="refreshTasks"
        :is-admin="isAdmin"
        :actor-id="actorId"
        :show-entitlement-column="isEntitlementCertificationType"
        @change-saving="setSaving"
        @check-progress="checkInProgress"
        @refresh-complete="refreshTasks = false"
        @signed-off="hideSignOff = true;"
        @set-totals="totals = $event"
        @update-details="getCertificationDetails" />
    </template>
    <p
      v-else
      class="lead text-center m-5">
      {{ $t("pages.loadPage.errorLoadingPage") }}
    </p>
  </div>
</template>

<script>
import BreadcrumbMixin from '@forgerock/platform-shared/src/mixins/BreadcrumbMixin';
import {
  getCertificationDetails,
  getInProgressTasksByCampaign,
  signOffCertificationTasks,
} from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import FrCertificationTaskHeader from './CertificationTaskHeader';
import FrCertificationTaskDetails from './CertificationTaskDetails';
import FrCertificationTaskList from './CertificationTaskList';

export default {
  name: 'CertificationTask',
  components: {
    FrCertificationTaskDetails,
    FrCertificationTaskHeader,
    FrCertificationTaskList,
  },
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      actorId: null,
      campaignDetails: {},
      campaignId: null,
      certifierId: null,
      hideSignOff: true,
      isDetailsLoading: false,
      isSaving: false,
      loadFailed: false,
      refreshTasks: false,
      totals: null,
    };
  },
  mixins: [BreadcrumbMixin],
  computed: {
    isComplete() {
      return this.totals?.NONE === undefined;
    },
    isEntitlementCertificationType() {
      return this.campaignDetails.certificationType === 'entitlement';
    },
  },
  methods: {
    getCertificationDetails() {
      this.isDetailsLoading = true;

      getCertificationDetails(this.campaignId)
        .then(({ data }) => {
          this.loadFailed = false;
          this.campaignDetails = data;
          this.actorId = this.$route.query.actorId;
        })
        .catch((error) => {
          this.loadFailed = true;
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.certificationDetailError'));
        })
        .finally(() => {
          this.isDetailsLoading = false;
        });
    },
    setSaving() {
      this.isSaving = !this.isSaving;
    },
    checkInProgress() {
      getInProgressTasksByCampaign(this.campaignId, this.isAdmin).then(({ data }) => {
        this.hideSignOff = !data.result.length;
      });
    },
    signOff() {
      this.setSaving();
      signOffCertificationTasks(this.campaignDetails.id, this.actorId)
        .catch((error) => {
          this.showErrorMessage(error, this.$t('governance.certificationTask.errors.signOffError'));
        }).finally(() => {
          this.refreshTasks = true;
          this.setSaving();
        });
    },
    goToBackUrl() {
      this.$router.push(this.getBreadcrumbRoute());
    },
  },
  mounted() {
    this.campaignId = this.$route?.params?.campaignId;
    this.actorId = this.$route.query.actorId;
    this.getCertificationDetails();
    let backUrl = '/access-reviews';
    if (this.isAdmin) {
      backUrl = `/certification/campaigns/${this.campaignId}/access-reviews`;
    }
    this.setBreadcrumb(backUrl, this.$t('governance.certificationTask.backLink'));
  },
};
</script>
<style lang="scss" scoped>
  .certification-task-container {
    background-color: $white;
    min-height: 100vh;
  }
</style>
