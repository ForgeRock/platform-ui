<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="d-flex align-items-center cursor-default">
    <BContainer
      class="pl-0 pr-0"
      fluid>
      <FrAlert
        class="w-100"
        show
        :variant="displayInfo.variant"
        :show-icon="false"
        :dismissible="false">
        <div class="d-flex flex-row">
          <FrIcon
            :icon-class="`md-24 mr-3 p-2`"
            :name="displayInfo.icon"
            role="img"
            tabindex="-1" />
          <div class="d-flex flex-column">
            <strong class="pb-1"> {{ displayInfo.title }}</strong>
            <span> {{ displayInfo.body }}</span>
          </div>
        </div>
      </FrAlert>
    </BContainer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  BContainer,
} from 'bootstrap-vue';
import { getConfidenceLevel, confidenceLevels } from '@forgerock/platform-shared/src/utils/governance/prediction';
import FrAlert from '@forgerock/platform-shared/src/components/Alert/';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
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
  objectDisplayName: {
    type: String,
    default: '',
  },
  userDisplayName: {
    type: String,
    default: '',
  },
});

const confidenceLevel = computed(() => getConfidenceLevel(props.prediction, props.autoIdSettings));

const displayInfo = computed(() => {
  const percentage = props.prediction.confidencePercentage;
  const { userDisplayName, objectDisplayName } = props;
  if (confidenceLevel.value === confidenceLevels.HIGH) {
    return {
      title: i18n.global.t('governance.recommendation.banner.recommended'),
      body: i18n.global.t('governance.recommendation.banner.highRecommendation', { percentage, userDisplayName, objectDisplayName }),
      variant: 'success',
      icon: props.prediction?.confidenceIcon,
    };
  }
  if (confidenceLevel.value === confidenceLevels.LOW) {
    return {
      title: i18n.global.t('governance.recommendation.banner.notRecommended'),
      body: i18n.global.t('governance.recommendation.banner.lowRecommendation', { percentage, userDisplayName, objectDisplayName }),
      variant: 'danger',
      icon: props.prediction?.confidenceIcon,
    };
  }
  return {
    title: i18n.global.t('governance.recommendation.banner.noRecommendation'),
    body: i18n.global.t('governance.recommendation.banner.noStrongRecommendation', { percentage, userDisplayName, objectDisplayName }),
    variant: 'warning',
    icon: props.prediction?.confidenceIcon,
  };
});
</script>
