<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-recognize-screen">
    <div class="fr-recognize-screen__content">
      <img
        :src="checkIcon"
        class="fr-recognize-success-icon"
        alt=""
        aria-hidden="true">
      <h2
        class="fr-recognize-screen__headline mb-2"
        tabindex="-1">
        {{ $t(`login.pingOneRecognize.done.${isEnrolment ? 'enroll' : 'auth'}Headline`) }}
      </h2>
      <p class="fr-recognize-screen__body text-muted">
        {{ $t(`login.pingOneRecognize.done.${isEnrolment ? 'enroll' : 'auth'}Body`) }}
      </p>
      <FrSpinner
        size="sm"
        class="fr-recognize-done-spinner mt-3" />
    </div>
    <div class="fr-recognize-screen__footer">
      <BButton
        variant="primary"
        @click="$emit('continue')">
        {{ $t('login.pingOneRecognize.done.continue') }}
      </BButton>
    </div>
  </div>
</template>

<script setup>
import { BButton } from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import checkIcon from '@forgerock/platform-shared/src/assets/images/check.svg';

defineProps({
  isEnrolment: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['continue']);
</script>
