<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="p-0 d-flex justify-content-start border-0 text-truncate">
    <div
      class="d-flex flex-row align-items-center text-truncate"
      no-body>
      <div>
        <img
          class="mr-3"
          width="24"
          height="28"
          :src="getApplicationLogo(access.application)"
          :alt="$t('common.logo')">
      </div>
      <BButton
        @click.stop="openEntitlementModal()"
        class="p-0"
        variant="link">
        <div class="d-flex flex-column text-truncate button-text">
          <h4 class="h6 mb-1 text-truncate">
            {{ access.application?.name }}
          </h4>
          <h3
            class="text-truncate w-100 m-0 h5"
            :id="`${access.id}-title`">
            {{ getAccessDisplayName(access) }}
          </h3>
        </div>
      </BButton>
    </div>
  </div>
  <div class="mt-4">
    <BRow class="mb-4">
      <BCol lg="6">
        <small class="d-block mb-2">
          {{ $t(`governance.access.startDate`) }}
        </small>
        {{ parseDate(access.item.decision?.accessRequest?.grantStartDate) }}
      </BCol>
    </BRow>
    <BRow class="mb-4">
      <BCol lg="6">
        <small class="d-block mb-2">
          {{ $t(`governance.access.endDate`) }}
        </small>
        {{ parseDate(access.item.decision?.accessRequest?.grantEndDate) }}
      </BCol>
    </BRow>
    <BRow
      v-if="showConfidenceScore()"
      class="mb-4">
      <BCol lg="6">
        <small class="d-block mb-2">
          {{ $t(`governance.access.recommendation`) }}
        </small>
        <FrRecommendationIcon
          :prediction="prediction"
          :id="access.id"
          type="certification"
          :auto-id-settings="autoIdSettings" />
      </BCol>
    </BRow>
  </div>
</template>

<script setup>

import {
  BButton,
  BCol,
  BRow,
} from 'bootstrap-vue';
import { computed } from 'vue';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import FrRecommendationIcon from '@forgerock/platform-shared/src/components/governance/Recommendations/RecommendationIcon';
import { getPredictionDisplayInfo } from '@forgerock/platform-shared/src/utils/governance/prediction';
import { getAccessDisplayName, parseDate } from '../../utils/accessUtility';

const emit = defineEmits([
  'open-selected-access-modal',
]);

const props = defineProps({
  access: {
    type: Object,
    default: () => ({}),
  },
  autoIdSettings: {
    type: Object,
    default: () => ({}),
  },
  userSchema: {
    type: Object,
    default: () => ({}),
  },
});

const prediction = computed(() => (props.access?.prediction ? getPredictionDisplayInfo(props.access, props.autoIdSettings, props.userSchema) : {}));

/**
 * Opens the entitlement modal
 */
function openEntitlementModal() {
  emit('open-selected-access-modal');
}

/**
 * Determines if prediction details can be shown
 */
function showConfidenceScore() {
  return prediction.value && Object.keys(prediction.value).length > 0;
}

</script>

<style lang="scss" scoped>
.button-text {
  text-align: left;
}

</style>
