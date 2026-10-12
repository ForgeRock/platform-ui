<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-recognize-screen">
    <h2
      class="fr-recognize-screen__headline"
      tabindex="-1">
      {{ $t(`login.pingOneRecognize.cameraInstructions.${isEnrolment ? 'enroll' : 'auth'}Headline`) }}
    </h2>
    <p class="fr-recognize-screen__subtitle text-muted">
      {{ $t(`login.pingOneRecognize.cameraInstructions.${isEnrolment ? 'enroll' : 'auth'}Subtitle`) }}
    </p>
    <div class="list-group w-100 mb-3">
      <div
        v-for="tip in cameraTips"
        :key="tip.icon"
        class="list-group-item fr-recognize-tip">
        <FrIcon
          :name="tip.icon"
          icon-class="fr-recognize-tip__icon"
          :style="{ color: primaryColor }"
          :outlined="false"
          aria-hidden="true" />
        <span class="fr-recognize-tip__content">
          <strong class="fr-recognize-tip__title">{{ tip.title }}</strong>
          <span class="fr-recognize-tip__body text-muted">{{ tip.body }}</span>
        </span>
      </div>
    </div>
    <BButton
      variant="primary"
      class="mt-3"
      @click="$emit('continue')">
      {{ $t('login.pingOneRecognize.cameraInstructions.continue') }}
    </BButton>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BButton } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import useTheme from '@forgerock/platform-shared/src/composables/theme';

defineProps({
  isEnrolment: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['continue']);

const { t } = useI18n();

const { theme } = useTheme();
const primaryColor = computed(() => theme.value.primaryColor);

const cameraTips = computed(() => [
  {
    icon: 'wb_sunny',
    title: t('login.pingOneRecognize.cameraInstructions.tip1Title'),
    body: t('login.pingOneRecognize.cameraInstructions.tip1Body'),
  },
  {
    icon: 'face',
    title: t('login.pingOneRecognize.cameraInstructions.tip2Title'),
    body: t('login.pingOneRecognize.cameraInstructions.tip2Body'),
  },
  {
    icon: 'do_not_disturb_on',
    title: t('login.pingOneRecognize.cameraInstructions.tip3Title'),
    body: t('login.pingOneRecognize.cameraInstructions.tip3Body'),
  },
  {
    icon: 'stay_current_portrait',
    title: t('login.pingOneRecognize.cameraInstructions.tip4Title'),
    body: t('login.pingOneRecognize.cameraInstructions.tip4Body'),
  },
]);
</script>
