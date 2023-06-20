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
        :task-status="taskStatus"
        @change-saving="setSaving"
        @review-forwarded="goToBackUrl"
        @sign-off="signOff" />
      <FrCertificationTaskDetails
        :totals="totals"
        :campaign-details="campaignDetails"
        :is-loading="isDetailsLoading" />
      <div
        v-if="isEntitlementCertificationType"
        class="border-top">
        <FrCertificationTaskList
          v-if="campaignId && actorId"
          :campaign-id="campaignId"
          :campaign-details="campaignDetails"
          :refresh-tasks="refreshTasks"
          :is-admin="isAdmin"
          :actor-id="actorId"
          :show-entitlement-column="isEntitlementCertificationType"
          :task-status="taskStatus"
          @change-saving="setSaving"
          @check-progress="checkInProgress"
          @refresh-complete="refreshTasks = false"
          @signed-off="hideSignOff = true;"
          @set-totals="totals = $event"
          @update-details="getCertificationDetails" />
      </div>
      <div
        v-else-if="!isGroupByAccount"
        class="border-top position-relative">
        <BTabs
          nav-class="fr-tabs pl-4"
          data-testid="certification-tasklist-tabs"
          lazy>
          <BTab
            v-if="isAccountTargetFilter"
            data-testid="cert-accounts-tab"
            title-link-class="py-4 text-capitalize"
            key="accounts"
            :title="$t('governance.certificationTask.certificationTabs.accounts')">
            <FrCertificationTaskList
              v-if="campaignId && actorId"
              certification-grant-type="accounts"
              :campaign-id="campaignId"
              :campaign-details="campaignDetails"
              :refresh-tasks="refreshTasks"
              :is-admin="isAdmin"
              :actor-id="actorId"
              :show-entitlement-column="false"
              :task-status="taskStatus"
              @hide-group-by="hideGroupBy"
              @change-saving="setSaving"
              @check-progress="checkInProgress"
              @refresh-complete="refreshTasks = false"
              @signed-off="hideSignOff = true;"
              @set-totals="totals = $event"
              @update-details="getCertificationDetails"
            />
          </BTab>
          <BTab
            v-if="isEntitlementTargetFilter"
            data-testid="cert-ents-tab"
            title-link-class="py-4 text-capitalize"
            key="entitlements"
            :title="$t('governance.certificationTask.certificationTabs.entitlements')">
            <FrCertificationTaskList
              v-if="campaignId && actorId"
              certification-grant-type="entitlements"
              :campaign-id="campaignId"
              :campaign-details="campaignDetails"
              :refresh-tasks="refreshTasks"
              :is-admin="isAdmin"
              :actor-id="actorId"
              :show-entitlement-column="true"
              :task-status="taskStatus"
              @change-saving="setSaving"
              @check-progress="checkInProgress"
              @refresh-complete="refreshTasks = false"
              @signed-off="hideSignOff = true;"
              @set-totals="totals = $event"
              @update-details="getCertificationDetails" />
          </BTab>
        </BTabs>
        <FrField
          v-if="showGroupByField"
          class="mb-4 text-capitalize group-by-position"
          v-model="isGroupByAccount"
          name="certificationGroupByAccount"
          testid="certification-group-by-account"
          type="checkbox"
          :label="$t('governance.certificationTask.certificationTabs.groupByAccount')" />
      </div>
      <div
        v-else-if="isGroupByAccount"
        class="border-top position-relative">
        <FrCertificationTaskListGroupBy
          certification-grant-type="accounts"
          :campaign-id="campaignId"
          :campaign-details="campaignDetails"
          :refresh-tasks="refreshTasks"
          :is-admin="isAdmin"
          :actor-id="actorId"
          :show-entitlement-column="isEntitlementCertificationType"
          :show-group-by="isGroupByAccount"
          :task-status="taskStatus"
          @change-saving="setSaving"
          @check-progress="checkInProgress"
          @refresh-complete="refreshTasks = false"
          @signed-off="hideSignOff = true;"
          @set-totals="totals = $event"
          @update-details="getCertificationDetails"
        />
        <FrField
          class="mb-4 text-capitalize group-by-position"
          v-model="isGroupByAccount"
          name="certificationGroupByAccount"
          testid="certification-group-by-account"
          type="checkbox"
          :label="$t('governance.certificationTask.certificationTabs.groupByAccount')" />
      </div>
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
  BTabs,
  BTab,
} from 'bootstrap-vue';
import {
  getCertificationDetails,
  getInProgressTasksByCampaign,
  signOffCertificationTasks,
} from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrCertificationTaskHeader from './CertificationTaskHeader';
import FrCertificationTaskDetails from './CertificationTaskDetails';
import FrCertificationTaskList from './CertificationTaskList';
import FrCertificationTaskListGroupBy from './CertificationTaskListGroupBy';

export default {
  name: 'CertificationTask',
  components: {
    FrCertificationTaskDetails,
    FrCertificationTaskHeader,
    FrCertificationTaskList,
    FrCertificationTaskListGroupBy,
    BTabs,
    BTab,
    FrField,
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
      taskStatus: null,
      totals: null,
      isGroupByAccount: false,
      showGroupByAccount: true,
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
    isAccountTargetFilter() {
      return this.isGrantType('accountGrant');
    },
    isEntitlementTargetFilter() {
      return this.isGrantType('entitlementGrant');
    },
    showGroupByField() {
      return this.isAccountTargetFilter && this.isEntitlementTargetFilter && this.showGroupByAccount;
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
      getInProgressTasksByCampaign(this.campaignId, this.isAdmin, this.taskStatus).then(({ data }) => {
        // verifies if the user has at least one sign-off permission for line items
        const atLeastOneSignoffPermission = (item) => {
          const reviewer = item.decision.certification.actors.find((actor) => actor.id === this.actorId);
          return reviewer?.permissions?.signoff;
        };
        const hasSignoffPermission = data.result.some(atLeastOneSignoffPermission);
        this.hideSignOff = !data.result.length || !hasSignoffPermission;
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
          if (this.isComplete) {
            this.goToBackUrl();
          }
        });
    },
    goToBackUrl() {
      this.$router.push(this.getBreadcrumbRoute());
    },
    hideGroupBy() {
      this.isGroupByAccount = false;
      this.showGroupByAccount = false;
    },
    /**
     * Verifies if a grant type is present in the campaign using the target filter types property.
     * @param {string} type - type of grant
     */
    isGrantType(type) {
      return this.campaignDetails.targetFilter?.type?.includes(type);
    },
  },
  mounted() {
    this.campaignId = this.$route?.params?.campaignId;
    this.actorId = this.$route.query.actorId;
    this.taskStatus = this.$route.query.taskStatus;
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
  .group-by-position {
    position: absolute;
    top: 25px;
    right: 45px;
  }
</style>
