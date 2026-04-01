<!-- Copyright 2023-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <!-- Status Card -->
    <BCard
      class="mb-4"
      data-testid="status-card"
    >
      <BRow class="align-items-center">
        <BCol cols="3">
          <h5 class="mb-0">
            {{ $t('governance.certificationDetails.statusCardLabel') }}
          </h5>
        </BCol>
        <BCol
          class="text-right"
          cols="3"
        >
          <BBadge
            data-testid="status-badge"
            :variant="statusVariants[campaign.status]"
          >
            {{ getStatusCampaignTranslationLabel(campaign.status) }}
          </BBadge>
        </BCol>
        <BCol
          v-if="campaign.status !== CampaignStates.EXPIRED && campaign.status !== CampaignStates.CLOSED && campaign.status !== CampaignStates.COMPLETE && campaign.status !== CampaignStates.CANCELLED"
          class="text-right"
          cols="6"
        >
          <div class="d-flex justify-content-end align-items-center">
            <BButton
              v-if="showCampaignsActions"
              class="text-nowrap d-none d-xl-block"
              data-testid="update-deadline-button"
              variant="link"
              @click="$bvModal.show('UpdateDeadlineModal')"
            >
              {{ $t('governance.certificationDetails.updateDeadlineButtonText') }}
            </BButton>
            <BButton
              v-if="showCampaignsActions"
              class="text-nowrap d-none d-xl-block"
              data-testid="cancel-campaign-button"
              variant="link"
              @click="$bvModal.show('CancelCampaignModal')"
            >
              {{ $t('governance.certificationDetails.cancelCampaignButtonText') }}
            </BButton>
            <BButton
              v-if="campaign.status === CampaignStates.STAGING"
              class="text-nowrap d-none d-xl-block"
              data-testid="delete-campaign-button"
              variant="link"
              @click="$bvModal.show('DeleteCampaignModal')"
            >
              {{ $t('governance.certificationDetails.deleteCampaignButtonText') }}
            </BButton>
            <BButton
              v-if="campaign.status === CampaignStates.STAGING"
              class="text-nowrap d-none d-xl-block"
              data-testid="activate-campaign-button"
              variant="primary"
              @click="$bvModal.show('ActivateCampaignModal')"
            >
              {{ $t('common.activate') }}
            </BButton>
            <FrActionsCell
              v-if="showCampaignsActions || campaign.status === CampaignStates.STAGING"
              class="d-xl-none"
              :edit-option="false"
              :delete-option="false"
              :divider="false"
            >
              <template #custom-top-actions>
                <BDropdownItem
                  v-if="showCampaignsActions"
                  data-testid="update-deadline-button-dropdown"
                  @click="$bvModal.show('UpdateDeadlineModal')"
                >
                  {{ $t('governance.certificationDetails.updateDeadlineButtonText') }}
                </BDropdownItem>
                <BDropdownItem
                  v-if="showCampaignsActions"
                  data-testid="cancel-campaign-button-dropdown"
                  @click="$bvModal.show('CancelCampaignModal')"
                >
                  {{ $t('governance.certificationDetails.cancelCampaignButtonText') }}
                </BDropdownItem>
                <BDropdownItem
                  v-if="campaign.status === CampaignStates.STAGING"
                  data-testid="delete-campaign-button-dropdown"
                  @click="$bvModal.show('DeleteCampaignModal')"
                >
                  {{ $t('governance.certificationDetails.deleteCampaignButtonText') }}
                </BDropdownItem>
                <BDropdownItem
                  v-if="campaign.status === CampaignStates.STAGING"
                  data-testid="activate-campaign-button-dropdown"
                  @click="$bvModal.show('ActivateCampaignModal')"
                >
                  {{ $t('common.activate') }}
                </BDropdownItem>
              </template>
            </FrActionsCell>
          </div>
        </BCol>
      </BRow>
    </BCard>
    <!-- Campaign Details -->
    <BCard
      class="mb-4"
      data-testid="campaign-details-card"
    >
      <h5 class="mb-4">
        {{ $t('governance.certificationDetails.campaingDetailsCardTitle') }}
      </h5>
      <BRow class="align-items-stretch">
        <BCol
          class="d-flex align-items-center justify-content-center"
          lg="6"
        >
          <FrCircleProgressBar
            data-testid="campaign-progress"
            :progress="progress"
            :size="256"
          >
            <template #count="{ count }">
              <h1 class="mb-0 display-4">
                {{ count.currentValue }}%
              </h1>
            </template>
            <template #caption>
              <p data-testid="campaign-progress-caption-text">
                {{
                  $t('governance.certificationDetails.campaignProgressCaptionText', {
                    complete: campaign.statistics.primaryReviewer.complete,
                    total: campaign.statistics.primaryReviewer.total,
                  })
                }}
              </p>
              <BButton
                variant="link"
                @click="goToAccessReviews"
              >
                {{ $t('governance.certificationDetails.accessReviewsLink') }}
              </BButton>
            </template>
          </FrCircleProgressBar>
        </BCol>
        <BCol lg="6">
          <BRow>
            <BCol
              cols="12"
              lg="6"
            >
              <dl data-testid="owner-info">
                <dt>
                  <small>{{ $t('governance.certificationDetails.campaignOwnerLabel') }}</small>
                </dt>
                <dd>
                  <div class="owner-info media align-items-center">
                    <BImg
                      class="mr-3 rounded-circle size-28"
                      :alt="campaignOwnerName"
                      :src="campaign.ownerInfo.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
                    />
                    <div class="owner-name media-body">
                      <div class="mb-0">
                        {{ campaignOwnerName }}
                      </div>
                      <div>
                        <small class="text-secondary m-0">
                          {{ campaign.ownerInfo.userName }}
                        </small>
                      </div>
                    </div>
                  </div>
                </dd>
              </dl>
            </BCol>
            <BCol
              cols="12"
              lg="6"
            >
              <dl data-testid="campaign-duration">
                <dt>
                  <small>{{ $t('governance.certificationDetails.campaignDurationLabel') }}</small>
                </dt>
                <dd>{{ campaignDuration }}</dd>
              </dl>
            </BCol>
            <BCol cols="6">
              <dl data-testid="campaign-start-date">
                <dt>
                  <small>{{ $t('governance.certificationDetails.campaignStartDateLabel') }}</small>
                </dt>
                <dd>{{ campaignStartDate }}</dd>
              </dl>
            </BCol>
            <BCol cols="6">
              <dl data-testid="campaign-deadline-date">
                <dt>
                  <small>{{ $t('governance.certificationDetails.campaignDeadlineLabel') }}</small>
                </dt>
                <dd class="d-flex align-items-center">
                  <span
                    v-if="campaign.status === 'in-progress'">
                    {{ campaignDeadlineFormatted }}
                  </span>
                  <FrIcon
                    v-else-if="campaign.status === 'expiring'"
                    icon-class="text-warning ml-2"
                    name="report_problem">
                    <template #prepend>
                      {{ campaignDeadlineFormatted }}
                    </template>
                  </FrIcon>
                  <FrIcon
                    v-else-if="campaign.status === 'overdue'"
                    icon-class="text-danger ml-1"
                    name="error_outline">
                    <template #prepend>
                      {{ campaignDeadlineFormatted }}
                    </template>
                  </FrIcon>
                </dd>
              </dl>
            </BCol>
          </BRow>
          <dl data-testid="campaign-description">
            <dt>
              <small>{{ $t('governance.certificationDetails.campaignDescriptionLabel') }}</small>
            </dt>
            <dd>
              <p class="max-lines max-lines-3 mb-2">
                {{ campaign.description }}
              </p>
              <BButton
                class="p-0"
                data-testid="show-description-button"
                variant="link"
                @click="$bvModal.show('ShowDescription')"
              >
                {{ $t('governance.certificationDetails.campaignDescriptionReadMoreLinkText') }}
              </BButton>
            </dd>
          </dl>
        </BCol>
      </BRow>
    </BCard>
    <!-- Charts -->
    <BRow class="align-items-stretch">
      <BCol
        class="mb-4"
        lg="4"
      >
        <FrVisualizationCard
          v-if="isEntitlementComposition"
          class="h-100"
          data-testid="chart-previous-decision"
          :title="$t('governance.certificationDetails.previousDecisionChartLabel')"
          :tooltip="$t('governance.certificationDetails.previousDecisionChartTooltip')"
        >
          <template #chart>
            <FrPieChart
              id="previous-decision-pie-chart"
              :height="120"
              :radius="50"
              :data="previousDecisionChart"
              :stroke-width="1"
              :width="120"
            />
          </template>
        </FrVisualizationCard>
        <FrVisualizationCard
          v-else
          class="h-100"
          data-testid="chart-users"
          :title="$t('governance.certificationDetails.usersChartLabel')"
          :tooltip="$t('governance.certificationDetails.usersChartTooltip')"
        >
          <template #chart>
            <FrPieChart
              id="users-pie-chart"
              :height="120"
              :radius="50"
              :data="campaignUsers"
              :stroke-width="1"
              :width="120"
            />
          </template>
        </FrVisualizationCard>
      </BCol>
      <BCol
        class="mb-4"
        lg="4"
      >
        <FrVisualizationCard
          class="h-100"
          data-testid="chart-decisions-breakdown"
          :title="$t('governance.certificationDetails.decisionsBreakdownChartLabel')"
          :tooltip="$t('governance.certificationDetails.decisionsBreakdownChartTooltip')"
        >
          <template #chart>
            <FrPieChart
              id="decisions-pie-chart"
              :height="120"
              :radius="50"
              :data="decisionsBreakdown"
              :no-data-label="noDataLabel"
              :stroke-width="1"
              :width="120"
            />
          </template>
        </FrVisualizationCard>
      </BCol>
      <BCol
        class="mb-4"
        lg="4"
      >
        <FrVisualizationCard
          class="h-100"
          data-testid="chart-decisions-by-app"
          :title="$t('governance.certificationDetails.decisionsByAppChartLabel')"
          :tooltip="$t('governance.certificationDetails.decisionsByAppChartTooltip')"
        >
          <template #chart>
            <FrPieChart
              id="application-pie-chart"
              :height="120"
              :radius="50"
              :data="decisionsByApp"
              :stroke-width="1"
              :width="120"
            />
          </template>
        </FrVisualizationCard>
      </BCol>
    </BRow>
    <!-- Modals -->
    <FrUpdateDeadlineModal
      :loading="isUpdateDeadlineInProgress"
      @update-deadline="updateDeadline"
    />
    <FrActivateCampaignModal @activate-campaign="activateCampaign" />
    <FrCancelCampaignModal @cancel-campaign="cancelCampaign" />
    <FrDeleteCampaignModal @delete-campaign="deleteCampaign" />
    <BModal
      id="ShowDescription"
      no-close-on-backdrop
      no-close-on-esc
      ok-only
      ok-variant="outline-primary"
      size="lg"
      title-class="h5"
      title-tag="h2"
      :ok-title="$t('governance.certificationDetails.showDescriptionModal.closeButtonText')"
      :title="$t('governance.certificationDetails.showDescriptionModal.title')">
      <div class="mb-4 d-block">
        {{ campaign.description }}
      </div>
    </BModal>
  </div>
</template>

<script>
import {
  BBadge,
  BButton,
  BCard,
  BCol,
  BDropdownItem,
  BImg,
  BModal,
  BRow,
} from 'bootstrap-vue';
import CertificationMixin from '@forgerock/platform-shared/src/mixins/Governance/Certification';
import dayjs from 'dayjs';
import FrActionsCell from '@forgerock/platform-shared/src/components/cells/ActionsCell';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPieChart from '@forgerock/platform-shared/src/components/Visualization/Charts/PieChart';
import FrVisualizationCard from '@forgerock/platform-shared/src/components/Visualization/VisualizationCard';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import { CampaignStates } from '@forgerock/platform-shared/src/utils/governance/types';
import {
  updateCampaignDeadline,
  activateCampaign,
  cancelCampaign,
  deleteCampaign,
} from '@forgerock/platform-shared/src/api/governance/CampaignApi';
import { getCampaignDuration } from '@forgerock/platform-shared/src/views/Governance/utils/certification';
import { DATE_FORMAT_MMM_D_COMMA_YYYY } from '@forgerock/platform-shared/src/utils/constants';
import { uiTypeMap } from '../../../Templates/templateTypes';
import FrActivateCampaignModal from './ActivateCampaignModal';
import FrCancelCampaignModal from './CancelCampaignModal';
import FrDeleteCampaignModal from './DeleteCampaignModal';
import FrUpdateDeadlineModal from './UpdateDeadlineModal';
import styles from '@/scss/main.scss';

export default {
  name: 'CampaignDetailsOverview',
  components: {
    BBadge,
    BButton,
    BCard,
    BCol,
    BDropdownItem,
    BImg,
    BModal,
    BRow,
    FrActionsCell,
    FrIcon,
    FrPieChart,
    FrUpdateDeadlineModal,
    FrVisualizationCard,
    FrActivateCampaignModal,
    FrCancelCampaignModal,
    FrDeleteCampaignModal,
    FrCircleProgressBar,
  },
  mixins: [
    CertificationMixin,
    NotificationMixin,
  ],
  props: {
    campaign: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      campaignDeadline: this.campaign.deadline,
      CampaignStates,
      isActivateCamapignInProgress: false,
      isCancelCamapignInProgress: false,
      isDeleteCamapignInProgress: false,
      isUpdateDeadlineInProgress: false,
      noDataLabel: this.$t('governance.certificationDetails.decisionsBreakdownChartNoDecisionsLabel'),
      statusVariant: null,
      statusVariants: {
        active: 'success',
        cancelled: 'light',
        closed: 'light',
        completed: 'success',
        creating: 'warning',
        expired: 'danger',
        expiring: 'warning',
        'in-progress': 'success',
        overdue: 'danger',
        pending: 'light',
        staging: 'light',
        'signed-off': 'success',
      },
    };
  },
  computed: {
    campaignOwnerName() {
      return this.$t('governance.certificationDetails.ownerNameLabel', {
        givenName: this.campaign.ownerInfo.givenName,
        sn: this.campaign.ownerInfo.sn,
      });
    },
    campaignDuration() {
      return getCampaignDuration(this.campaign.stageDuration);
    },
    campaignStartDate() {
      return this.campaign.startDate ? dayjs(this.campaign.startDate).format(DATE_FORMAT_MMM_D_COMMA_YYYY) : '–';
    },
    campaignDeadlineFormatted() {
      return this.campaignDeadline ? dayjs(this.campaignDeadline).format(DATE_FORMAT_MMM_D_COMMA_YYYY) : '–';
    },
    campaignUsers() {
      const usersChartColors = {
        new: styles.green,
        previous: styles.blue,
      };
      return Object.entries(this.campaign.statistics.userCount)
        .map(([key, value]) => ({
          label: this.$t(`governance.certificationDetails.usersChartItemsLabel.${key}`),
          color: usersChartColors[key],
          value,
        }));
    },
    decisionsBreakdown() {
      const decisionsBreakdownChartColors = {
        certify: styles.green,
        revoke: styles.blue,
        exception: styles.yellow,
      };
      return Object.entries(this.campaign.statistics.currentDecision)
        .filter(([key]) => Object.keys(decisionsBreakdownChartColors).includes(key))
        .map(([key, value]) => ({
          label: this.$t(`governance.certificationDetails.decisionsBreakdownChartItemsLabel.${key}`),
          color: decisionsBreakdownChartColors[key],
          value,
        }));
    },
    decisionsByApp() {
      const colors = [styles.green, styles.blue, styles.yellow, styles.orchid, styles.skyblue];
      return Object.entries(this.campaign.statistics.decisionsByApplication)
        .sort(([, valueA], [, valueB]) => valueB - valueA)
        .reduce((acc, [key, value], index) => {
          if (index < 5) {
            acc.push({
              color: colors[index],
              label: key,
              value,
            });
          } else {
            if (index === 5) {
              acc[4].label = this.$t('governance.certificationDetails.decisionsBreakdownChartItemsLabelOther');
            }
            acc[4].value += value;
          }
          return acc;
        }, []);
    },
    progress() {
      const progress = this.campaign.progress * 100;
      return progress >= 50
        ? Math.floor(progress)
        : Math.ceil(progress);
    },
    showCampaignsActions() {
      const excludeStatuses = [CampaignStates.STAGING, CampaignStates.COMPLETE, CampaignStates.SIGNED_OFF];
      return !excludeStatuses.includes(this.campaign.status);
    },
    isEntitlementComposition() {
      return this.campaign.certificationType === uiTypeMap.ENTITLEMENTCOMPOSITION;
    },
    previousDecisionChart() {
      const colors = [styles.green, styles.blue];
      const stats = this.campaign.statistics.previousDecision || {};
      const previouslyReviewed = stats.previouslyReviewed || 0;
      const total = stats.total || 0;
      const neverCertified = Math.max(total - previouslyReviewed, 0);

      return [
        {
          color: colors[0],
          label: this.$t('governance.certificationDetails.previousDecisionChartItemsLabel.previouslyReviewed'),
          value: previouslyReviewed,
        },
        {
          color: colors[1],
          label: this.$t('governance.certificationDetails.previousDecisionChartItemsLabel.neverCertified'),
          value: neverCertified,
        },
      ];
    },
  },
  methods: {
    updateDeadline(newDeadline) {
      this.isUpdateDeadlineInProgress = true;
      updateCampaignDeadline(this.campaign.id, newDeadline).then((response) => {
        this.campaignDeadline = response.deadline;
        this.displayNotification('success', this.$t('governance.certificationDetails.deadlineSuccessfullyUpdatedMessage'));
        this.$bvModal.hide('UpdateDeadlineModal');
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationDetails.errors.errorUpdatingDeadlineDefault'));
      }).finally(() => {
        this.isUpdateDeadlineInProgress = false;
      });
    },
    activateCampaign() {
      this.isActivateCamapignInProgress = true;
      activateCampaign(this.campaign.id).then((response) => {
        this.$emit('update:status', response.status);
        this.displayNotification('success', this.$t('governance.certificationDetails.campaignSuccessfullyActivated'));
        this.$bvModal.hide('ActivateCampaignModal');
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationDetails.errors.errorActivatingCampaignDefault'));
      }).finally(() => {
        this.isActivateCamapignInProgress = false;
      });
    },
    cancelCampaign() {
      this.isCancelCamapignInProgress = true;
      cancelCampaign(this.campaign.id).then(() => {
        this.displayNotification('success', this.$t('governance.certificationDetails.campaignSuccessfullyCanceled'));
        this.$bvModal.hide('CancelCampaignModal');
        this.$router.push({
          name: 'Certification',
          params: {
            certificationTab: 'overview',
          },
        });
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationDetails.errors.errorCancelingCampaignDefault'));
      }).finally(() => {
        this.isCancelCamapignInProgress = false;
      });
    },
    deleteCampaign() {
      this.isDeleteCamapignInProgress = true;
      deleteCampaign(this.campaign.id).then(() => {
        this.displayNotification('success', this.$t('governance.certificationDetails.campaignSuccessfullyDeleted'));
        this.$bvModal.hide('DeleteCampaignModal');
        this.$router.push({ name: 'Certification' });
      }).catch((error) => {
        this.showErrorMessage(error, this.$t('governance.certificationDetails.errors.errorDeletingCampaignDefault'));
      }).finally(() => {
        this.isDeleteCamapignInProgress = false;
      });
    },
    goToAccessReviews() {
      this.$router.push({
        name: 'CampaignDetails',
        params: {
          campaignId: this.campaign.id,
          tab: 'access-reviews',
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
  .owner-info {
    margin-top: 2px;

    .owner-name {
      line-height: 1.25rem;
    }
  }
</style>
