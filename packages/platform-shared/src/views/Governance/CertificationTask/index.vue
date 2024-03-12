<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="certification-task-container">
    <FrCertificationToolbar
      :actor-id="actorId"
      :campaign-details="campaignDetails"
      :hide-sign-off="hideSignOff"
      :is-complete="isComplete"
      :is-saving="isSaving"
      :task-status="taskStatus"
      @change-saving="setSaving"
      @review-forwarded="goToBackUrl"
      @sign-off="signOff" />
    <p
      v-if="loadFailed"
      class="lead text-center m-5">
      {{ $t("pages.loadPage.errorLoadingPage") }}
    </p>
    <template v-else>
      <FrCertificationDetails
        :totals="totals"
        :campaign-details="campaignDetails"
        :is-loading="isDetailsLoading" />
      <div class="border-top position-relative">
        <template v-if="!isGroupByAccount">
          <BTabs
            :nav-class="['fr-tabs', 'pl-4', { 'd-none': hideTabs}]"
            data-testid="certification-tasklist-tabs"
            lazy>
            <BTab
              v-for="tab in grantTypeTabs"
              :key="tab.key"
              title-link-class="py-4 text-capitalize"
              :data-testid="`cert-${tab.key}-tab`"
              :title="tab.label">
              <FrTaskList
                v-if="campaignId && actorId"
                :certification-grant-type="tab.key"
                :campaign-id="campaignId"
                :campaign-details="campaignDetails"
                :refresh-tasks="refreshTasks"
                :is-admin="isAdmin"
                :actor-id="actorId"
                :task-status="taskStatus"
                @hide-group-by="hideGroupBy"
                @change-saving="setSaving"
                @check-progress="checkInProgress"
                @refresh-complete="refreshTasks = false"
                @signed-off="hideSignOff = true;"
                @set-totals="totals = $event"
                @update-details="getCertificationDetails" />
            </BTab>
          </BTabs>
        </template>
        <FrTaskListGroupBy
          v-else
          certification-grant-type="accounts"
          :campaign-id="campaignId"
          :campaign-details="campaignDetails"
          :refresh-tasks="refreshTasks"
          :is-admin="isAdmin"
          :actor-id="actorId"
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
          v-if="showGroupByField"
          class="mb-4 text-capitalize group-by-position"
          v-model="isGroupByAccount"
          name="certificationGroupByAccount"
          testid="certification-group-by-account"
          type="checkbox"
          :label="$t('governance.certificationTask.certificationTabs.groupByAccount')" />
      </div>
    </template>
  </div>
</template>

<script>
import useBreadcrumb from '@forgerock/platform-shared/src/composables/breadcrumb';
import {
  BTabs,
  BTab,
} from 'bootstrap-vue';
import {
  getCertificationDetails,
  getInProgressTasksByCampaign,
  signOffCertificationTasks,
} from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrCertificationDetails from './TaskHeader/CertificationDetails';
import FrCertificationToolbar from './TaskHeader/CertificationToolbar';
import FrTaskList from './TaskList';
import FrTaskListGroupBy from './TaskListGroupBy';

export default {
  name: 'CertificationTask',
  mixins: [
    NotificationMixin,
  ],
  components: {
    BTab,
    BTabs,
    FrCertificationDetails,
    FrCertificationToolbar,
    FrField,
    FrTaskList,
    FrTaskListGroupBy,
  },
  props: {
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { setBreadcrumb } = useBreadcrumb();
    return { setBreadcrumb };
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
      backUrl: '/access-reviews',
    };
  },
  computed: {
    hideTabs() {
      return this.grantTypeTabs.length === 1;
    },
    grantTypeTabs() {
      const tabs = [];
      if (this.isAccountTargetFilter) {
        tabs.push({
          key: 'accounts',
          label: this.$t('governance.certificationTask.certificationTabs.accounts'),
        });
      }
      if (this.isEntitlementTargetFilter) {
        tabs.push({
          key: 'entitlements',
          label: this.$t('governance.certificationTask.certificationTabs.entitlements'),
        });
      }
      if (this.isRoleTargetFilter) {
        tabs.push({
          key: 'roles',
          label: this.$t('common.roles'),
        });
      }
      return tabs;
    },
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
    isRoleTargetFilter() {
      return this.isGrantType('roleMembership');
    },
    showGroupByField() {
      return this.isAccountTargetFilter && this.isEntitlementTargetFilter && !this.isRoleTargetFilter && this.showGroupByAccount;
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
      this.$router.push(this.backUrl);
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
    if (this.isAdmin) {
      this.backUrl = `/certification/campaigns/${this.campaignId}/access-reviews`;
    }
    this.setBreadcrumb(this.backUrl, this.$t('governance.certificationTask.backLink'));
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
