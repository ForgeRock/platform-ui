<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-recognize-screen">
    <h2
      class="fr-recognize-screen__headline"
      tabindex="-1">
      {{ $t('login.pingOneRecognize.cameraPermission.headline') }}
    </h2>
    <FrIcon
      name="videocam"
      icon-class="fr-recognize-screen__icon"
      :style="{ color: primaryColor }"
      :outlined="false"
      aria-hidden="true" />
    <p class="fr-recognize-screen__body text-muted">
      {{ $t(`login.pingOneRecognize.cameraPermission.${isEnrolment ? 'enroll' : 'auth'}Body`) }}
    </p>
    <p
      class="fr-recognize-screen__body text-muted"
      v-html="$t(`login.pingOneRecognize.cameraPermission.${isEnrolment ? 'enroll' : 'auth'}BodyPrompt`)" />
    <BButton
      variant="primary"
      class="mt-3"
      @click="$emit('allow')">
      {{ $t('login.pingOneRecognize.cameraPermission.allow') }}
    </BButton>
    <BButton
      variant="link"
      class="mt-1"
      @click="$emit('deny')">
      {{ $t('login.pingOneRecognize.cameraPermission.dontAllow') }}
    </BButton>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { BButton } from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import useTheme from '@forgerock/platform-shared/src/composables/theme';

defineProps({
  isEnrolment: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['allow', 'deny']);

const { theme } = useTheme();
const primaryColor = computed(() => theme.value.primaryColor);
</script>
