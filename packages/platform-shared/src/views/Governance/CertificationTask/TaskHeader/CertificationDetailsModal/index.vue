<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="certificationCampaignDetails"
    size="lg"
    ok-only
    ok-variant="outline-primary"
    :ok-title="$t('common.done')"
    :title="$t('governance.certificationTask.campaignDetails.title')">
    <div class="details-container">
      <div class="d-flex justify-content-start align-items-center mb-4">
        <div class="d-flex w-50 flex-column">
          <span
            class="text-muted">
            {{ $t('governance.certificationTask.campaignDetails.campaignOwner') }}
          </span>
          <span class="text-dark">
            {{ campaignDetails.ownerInfo && campaignDetails.ownerInfo.userName }}
          </span>
        </div>
        <div class="d-flex w-50 flex-column">
          <span
            class="text-muted">
            {{ $t('governance.certificationTask.campaignDetails.duration') }}
          </span>
          <span class="text-dark">
            {{ campaignDetails.stageDuration }}
          </span>
        </div>
      </div>
      <div class="d-flex justify-content-start align-items-center mb-4">
        <div class="d-flex w-50 flex-column">
          <span
            class="text-muted">
            {{ $t('governance.certificationTask.campaignDetails.startDate') }}
          </span>
          <span class="text-dark">
            {{ formatDate(campaignDetails.startDate) }}
          </span>
        </div>
        <div class="d-flex w-50 flex-column">
          <span
            class="text-muted">
            {{ $t('common.deadline') }}
          </span>
          <span class="text-dark">
            {{ formatDate(campaignDetails.deadline) }}
          </span>
        </div>
      </div>
      <div class="d-flex flex-column">
        <span
          class="text-muted">
          {{ $t('governance.certificationTask.campaignDetails.description') }}
        </span>
        <span class="text-dark">
          {{ campaignDetails.description }}
        </span>
      </div>
    </div>
  </BModal>
</template>

<script>
import {
  BModal,
} from 'bootstrap-vue';
import dayjs from 'dayjs';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';

export default {
  name: 'CertificationDetailsModal',
  components: {
    BModal,
  },
  props: {
    /**
     * this is the campaign details object
    */
    campaignDetails: {
      type: Object,
      default: null,
    },
  },
  methods: {
    formatDate(date) {
      if (date) return dayjs(date).format('MMM D, YYYY');
      return blankValueIndicator;
    },
  },
};
</script>
<style lang="scss" scoped>
  .details-container {
    display: flex;
    flex-direction: column;
  }
</style>
