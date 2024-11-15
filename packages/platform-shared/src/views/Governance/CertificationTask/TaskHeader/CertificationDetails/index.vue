<!-- Copyright (c) 2023-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="mx-5 mt-4 mb-4">
    <BRow>
      <BCol
        class="d-flex justify-content-center"
        cols="6"
        md="4"
        lg="4">
        <div>
          <h5>{{ $t('common.status') }}</h5>
          <div class="d-flex align-items-center">
            <div class="details-chart position-relative">
              <FrCircleProgressBar
                id="status-chart"
                :progress="progress"
                :thickness="7"
                :empty-thickness="7"
                :empty-color="styles.brightGray"
                :size="72">
                <template #count="{ count }">
                  <small class="font-weight-bold mb-0">
                    {{ count.currentValue }}%
                  </small>
                </template>
              </FrCircleProgressBar>
            </div>
            <div class="ml-2">
              <span> {{ sumOfDecisions }} / {{ total }} items completed</span>
            </div>
          </div>
        </div>
      </BCol>
      <BCol
        class="d-flex justify-content-center"
        cols="6"
        md="4"
        lg="4">
        <div>
          <h5>{{ $t('governance.certificationTask.decisions') }}</h5>
          <div class="d-flex align-items-center">
            <FrPieChart
              id="decisions-chart"
              hide-tooltip
              legend-class="decisions-legend"
              show-legend-count
              :data="chartDecisions"
              :no-data-label="noDataLabel"
              :height="72"
              :radius="27"
              :stroke-width="1"
              :width="72"
            />
          </div>
        </div>
      </BCol>
      <BCol
        class="d-flex justify-content-center"
        cols="12"
        md="4"
        lg="4">
        <div>
          <h5>{{ $t('common.deadline') }}</h5>
          <div class="mt-2">
            <FrIcon
              icon-class="d-inline"
              name="event">
              {{ formatDate(campaignDetails.deadline) }}
            </FrIcon>
          </div>
          <BButton
            class="my-4 p-0"
            variant="link"
            @click="viewDetails()">
            {{ $t('governance.certificationTask.viewCampaignDetails') }}
          </BButton>
        </div>
      </BCol>
    </BRow>
    <BCol
      v-if="$route.params.certifier"
      class="d-flex justify-content-center"
      cols="6"
      md="12">
      <BMedia
        class="align-items-center mt-4"
        no-body>
        <BImg
          v-if="isCertifierAUser"
          data-testid="certifier-image-user"
          class="mr-2 rounded-circle size-28"
          :alt="$t('governance.certificationDetails.ownerNameLabel', { givenName: certifierName().givenName, sn: certifierName().sn })"
          :src="$route.params.certifier.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
          fluid />
        <FrIcon
          v-else
          data-testid="certifier-image-role"
          icon-class="mr-1 md-28 rounded-circle"
          name="assignment_ind" />
        <div class="media-body">
          <span
            test-id="certifier-name"
            class="text-dark mr-1"
            v-html="$t('governance.certificationTask.defaultCertifierText', { name: `${certifierName().givenName} ${certifierName().sn}` })" />
        </div>
      </BMedia>
    </BCol>
    <template v-if="isLoading">
      <FrSpinner class="py-5" />
    </template>
    <FrCertificationDetailsModal
      v-else
      :campaign-details="campaignDetails"
    />
  </div>
</template>

<script>
import {
  BButton,
  BCol,
  BImg,
  BMedia,
  BRow,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import FrCircleProgressBar from '@forgerock/platform-shared/src/components/CircleProgressBar';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrPieChart from '@forgerock/platform-shared/src/components/Visualization/Charts/PieChart';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import styles from '@/scss/main.scss';
import FrCertificationDetailsModal from '../CertificationDetailsModal';

export default {
  name: 'CertificationDetails',
  components: {
    BButton,
    BCol,
    BImg,
    BMedia,
    BRow,
    FrCertificationDetailsModal,
    FrCircleProgressBar,
    FrIcon,
    FrPieChart,
    FrSpinner,
  },
  data() {
    return {
      chartDecisions: [],
      isSaving: true,
      noDataLabel: this.$t('governance.certificationTask.noDecision'),
      styles,
      sumOfDecisions: 0,
      total: 0,
    };
  },
  props: {
    /**
     * this is the campaign details object
    */
    campaignDetails: {
      type: Object,
      default: null,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    totals: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    viewDetails() {
      this.$root.$emit('bv::show::modal', 'certificationCampaignDetails');
    },
    formatDate(date) {
      if (date) return dayjs(date).format('MMM D, YYYY');
      return blankValueIndicator;
    },
    setChartInfo(revoked, certified) {
      this.chartDecisions = [{
        label: this.$t('governance.certificationTask.certified'),
        color: styles.green,
        value: certified,
      },
      {
        label: this.$t('governance.certificationTask.revoked'),
        color: styles.blue,
        value: revoked,
      }];
    },
    getProgress(totals) {
      if (!totals) return;

      const certified = totals.certify || 0;
      const revoke = totals.revoke || 0;
      const notActed = totals.NONE || 0;
      this.total = totals.total || 0;

      this.sumOfDecisions = this.total - notActed;
      this.setChartInfo(revoke, certified);
    },

    /**
     *  The method retrieves an object containing the specified name and surname of the certifier.
     Useful for displaying the name of the certifier in the certification task details when is a user or role
     */
    certifierName() {
      const givenName = this.$route.params.certifier.givenName || this.$route.params.certifier.name;
      const sn = this.$route.params.certifier.sn || '';

      return {
        givenName,
        sn,
      };
    },
  },
  watch: {
    totals: {
      deep: true,
      handler(newVal) {
        this.getProgress(newVal);
      },
    },
  },
  computed: {
    progress() {
      if (!this.sumOfDecisions || !this.total) return 0;

      const progress = (this.sumOfDecisions / this.total) * 100;

      return progress >= 50
        ? Math.floor(progress)
        : Math.ceil(progress);
    },
    isCertifierAUser() {
      return this.$route.params.certifier?.key.startsWith('managed/user');
    },
  },
};
</script>
<style lang="scss" scoped>
.details-chart {
  width: 100px;
  height: 100%;
}
.certification-task-header {
    display: flex;
    justify-content: space-between;
    padding: 16px 24px;
    align-content: center;
    background-color: $white;
    height: 80px;
    border-bottom: 1px solid $gray-200;
}
:deep(.decisions-legend) {
  position: absolute;
  top: 0px;
  left: 100px;
  width: 130px;
}
</style>
