<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-recognize-screen">
    <h2
      class="fr-recognize-screen__headline"
      tabindex="-1">
      {{ $t(`login.pingOneRecognize.error.${isEnrolment ? 'enroll' : 'auth'}Headline`) }}
    </h2>
    <FrAlert
      class="fr-recognize-alert w-100"
      :show="true"
      :dismissible="false"
      variant="danger">
      <div class="fr-recognize-alert__content">
        <div>{{ errorMessage || $t(`login.pingOneRecognize.error.${isEnrolment ? 'enroll' : 'auth'}AlertBody`) }}</div>
        <div
          v-if="sdkMessage"
          class="fr-recognize-alert__detail">
          {{ $t('login.pingOneRecognize.error.errorLabel') }} <code>{{ sdkMessage }}</code>
        </div>
        <div
          v-if="sdkCauseMessage"
          class="fr-recognize-alert__detail">
          {{ $t('login.pingOneRecognize.error.errorCauseLabel') }} <code>{{ sdkCauseMessage }}</code>
        </div>
      </div>
    </FrAlert>
    <p
      v-if="!errorCode.startsWith('SERVER_') && !errorCode.startsWith('CORE_')"
      class="fr-recognize-screen__body text-muted">
      {{ $t(`login.pingOneRecognize.error.${isEnrolment ? 'enroll' : 'auth'}Body`) }}
    </p>
    <BButton
      variant="primary"
      class="mt-3"
      @click="$emit('continue')">
      {{ $t('login.pingOneRecognize.error.continue') }}
    </BButton>
  </div>
</template>

<script setup>
import { BButton } from 'bootstrap-vue';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';

defineProps({
  isEnrolment: {
    type: Boolean,
    required: true,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  errorCode: {
    type: String,
    default: '',
  },
  sdkMessage: {
    type: String,
    default: '',
  },
  sdkCauseMessage: {
    type: String,
    default: '',
  },
});

defineEmits(['continue']);
</script>
