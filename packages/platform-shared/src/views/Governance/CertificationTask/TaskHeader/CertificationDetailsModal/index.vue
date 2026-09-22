<!-- Copyright (c) 2023-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="certificationCampaignDetails"
    size="lg"
    ok-only
    ok-variant="outline-primary"
    :static="isTesting"
    :ok-title="$t('common.done')"
    :title="$t('governance.certificationTask.campaignDetails.title')">
    <dl class="details-container mb-0">
      <div class="w-50 mb-4">
        <dt class="text-muted">
          {{ $t('governance.certificationTask.campaignDetails.campaignOwner') }}
        </dt>
        <dd class="text-dark mb-0">
          {{ campaignDetails.ownerInfo && campaignDetails.ownerInfo.userName }}
        </dd>
      </div>
      <div class="w-50 mb-4">
        <dt class="text-muted">
          {{ $t('governance.certificationTask.campaignDetails.duration') }}
        </dt>
        <dd class="text-dark mb-0">
          {{ campaignDetails.stageDuration }}
        </dd>
      </div>
      <div class="w-50 mb-4">
        <dt class="text-muted">
          {{ $t('governance.certificationTask.campaignDetails.startDate') }}
        </dt>
        <dd class="text-dark mb-0">
          {{ formatDate(campaignDetails.startDate) }}
        </dd>
      </div>
      <div class="w-50 mb-4">
        <dt class="text-muted">
          {{ $t('common.deadline') }}
        </dt>
        <dd class="text-dark mb-0">
          {{ formatDate(campaignDetails.deadline) }}
        </dd>
      </div>
      <div class="w-100">
        <dt class="text-muted">
          {{ $t('governance.certificationTask.campaignDetails.description') }}
        </dt>
        <dd class="text-dark mb-0">
          {{ campaignDetails.description }}
        </dd>
      </div>
    </dl>
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
    isTesting: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return blankValueIndicator;
      try {
        return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date));
      } catch {
        return dayjs(date).format('MMM D, YYYY');
      }
    },
  },
};
</script>
<style lang="scss" scoped>
  // dl is the flex row; each div is one name-value group (two per row at w-50).
  // Valid dl content model: dt/dd must be direct children of the group div.
  // align-items: center keeps vertically centered rows like the old row divs did.
  .details-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    // dt carries the browser default bold from reboot; the original labels
    // were normal-weight muted spans, so keep them visually unchanged.
    dt {
      font-weight: inherit;
    }

    dd {
      margin-left: 0;
    }
  }
</style>
