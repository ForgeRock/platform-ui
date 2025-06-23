<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="d-flex align-items-center cursor-default">
    <FrIcon
      :aria-label="$t(`governance.prediction.${prediction.confidenceLevel}`)"
      :icon-class="`color-${prediction.confidenceIconColor} bg-light${prediction.confidenceIconColor} rounded-circle md-24 mr-3 p-2`"
      :id="`predictionIcon-${id}`"
      :name="prediction.confidenceIcon"
      role="img"
      tabindex="-1" />
    <BPopover
      :target="`predictionIcon-${id}`"
      boundary="window"
      triggers="hover"
      :show="testMode ? true : undefined"
      placement="right">
      <div class="p-3">
        <h3
          class="text-truncate h5"
          title="title">
          {{ displayInfo.title }}
        </h3>
        <p
          class="max-lines max-lines-10"
          title="body">
          <span v-html="displayInfo.body" />
        </p>
        <ul class="mt-2 pl-3">
          <li
            v-for="(rule, index) in displayInfo.rules"
            :key="index">
            <strong>{{ rule.displayName }}:</strong> {{ rule.value }}
          </li>
        </ul>
      </div>
    </BPopover>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  BPopover,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { getConfidenceLevel, confidenceLevels } from '@forgerock/platform-shared/src/utils/governance/prediction';
import i18n from '@/i18n';

const props = defineProps({
  prediction: {
    type: Object,
    default: () => ({}),
  },
  autoIdSettings: {
    type: Object,
    default: () => ({}),
  },
  id: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: '',
  },
  object: {
    type: String,
    default: '',
  },
  testMode: {
    type: Boolean, // Specifically for testing purposes
  },
});

const confidenceLevel = computed(() => getConfidenceLevel(props.prediction, props.autoIdSettings));

/**
 * Will return the display name for the object that a recommendation is for, defaults to entitlement
 * for cert and approval, since that is the only object currently supported.
 */
function getObjectDisplayName() {
  switch (props.type) {
    case 'certification':
    case 'approval':
      return props.object || i18n.global.t('governance.recommendation.entitlement');
    default:
      return i18n.global.t('governance.recommendation.genericObject');
  }
}

const displayInfo = computed(() => {
  const percentage = props.prediction.confidencePercentage;
  const object = getObjectDisplayName();
  if (confidenceLevel.value === confidenceLevels.HIGH) {
    return {
      title: i18n.global.t('governance.recommendation.popover.recommended'),
      body: i18n.global.t('governance.recommendation.popover.highRecommendation', { percentage, object }),
      rules: props.prediction?.rule,
    };
  }
  if (confidenceLevel.value === confidenceLevels.LOW) {
    return {
      title: i18n.global.t('governance.recommendation.popover.notRecommended'),
      body: i18n.global.t('governance.recommendation.popover.lowRecommendation', { percentage, object }),
      rules: props.prediction?.rule,
    };
  }
  if (confidenceLevel.value === confidenceLevels.MEDIUM) {
    return {
      title: i18n.global.t('governance.recommendation.popover.noRecommendation'),
      body: i18n.global.t('governance.recommendation.popover.noStrongRecommendation', { percentage, object }),
      rules: props.prediction?.rule,
    };
  }
  return {
    title: i18n.global.t('governance.recommendation.popover.noRecommendation'),
    body: i18n.global.t('governance.recommendation.popover.noRecommendationAvailable', { object }),
  };
});
</script>
