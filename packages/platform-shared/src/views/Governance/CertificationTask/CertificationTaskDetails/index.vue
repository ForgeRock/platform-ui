<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="mx-5 mt-5 mb-4">
    <div class="d-flex justify-content-around">
      <div>
        <h5>{{ $t('common.status') }}</h5>
        <div class="d-flex align-items-center">
          <div class="details-chart position-relative">
            <FrInlinePieChart
              id="status-chart"
              height="100"
              :progress="progress"
            />
          </div>
          <div class="ml-2">
            <span> {{ sumOfDecisions }} / {{ total }} </span>
          </div>
        </div>
      </div>
      <div>
        <h5>{{ $t('governance.certificationTask.decisions') }}</h5>
        <div class="d-flex align-items-center">
          <div class="details-chart position-relative">
            <FrPieChart
              height="100"
              :data="chartDecisions"
              :adapt-to-heigh="true" />
          </div>
        </div>
      </div>
      <div class="d-flex flex-column">
        <h5>{{ $t('common.deadline') }}</h5>
        <div class="mt-2">
          <FrIcon
            class="d-inline"
            name="event" />
          <span>{{ formatDate(campaignDetails.deadLine) }}</span>
        </div>
        <BButton
          class="my-4 p-0"
          variant="link"
          @click="viewDetails()">
          {{ $t('governance.certificationTask.viewCampaignDetails') }}
        </BButton>
      </div>
    </div>
    <div
      class="d-flex justify-content-center"
      v-if="$route.params.certifier">
      <BMedia
        class="align-items-center mt-5"
        no-body>
        <BImg
          class="mr-2 rounded-circle"
          height="28"
          width="28"
          :alt="`${$route.params.certifier.givenName} ${$route.params.certifier.sn}`"
          :src="$route.params.certifier.profileImage || require('@forgerock/platform-shared/src/assets/images/avatar.png')"
          fluid />
        <div class="media-body">
          <span
            class="text-dark mr-1"
            v-html="$t('governance.certificationTask.defaultCertifierText', { name: `${$route.params.certifier.givenName} ${$route.params.certifier.sn}` })" />
        </div>
      </BMedia>
    </div>
    <template v-if="isLoading">
      <FrSpinner class="py-5" />
    </template>
    <FrCertificationCampaignDetailsModal
      v-else
      :campaign-details="campaignDetails"
    />
  </div>
</template>

<script>
import {
  BButton,
  BMedia,
  BImg,
} from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import dayjs from 'dayjs';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrInlinePieChart from '@forgerock/platform-shared/src/components/Visualization/Charts/InlinePieChart';
import FrCertificationCampaignDetailsModal from '@forgerock/platform-shared/src/views/Governance/CertificationTask/CertificationCampaignDetailsModal';
import FrPieChart from '@forgerock/platform-shared/src/components/Visualization/Charts/PieChart';
import styles from '@/scss/main.scss';

export default {
  name: 'CertificationTaskDetails',
  components: {
    BButton,
    FrCertificationCampaignDetailsModal,
    FrIcon,
    FrInlinePieChart,
    FrSpinner,
    FrPieChart,
    BMedia,
    BImg,
  },
  data() {
    return {
      chartDecisions: [],
      isSaving: true,
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
      return dayjs(date).format('MMM D, YYYY');
    },
    setChartInfo(revoked, certified) {
      this.chartDecisions = [{
        label: this.$t('governance.certificationTask.certified'),
        color: styles.blue,
        value: certified,
      },
      {
        label: this.$t('governance.certificationTask.revoked'),
        color: styles.yellow,
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
</style>
