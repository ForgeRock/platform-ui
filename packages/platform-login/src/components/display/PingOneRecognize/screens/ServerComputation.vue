<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-recognize-screen">
    <FrSpinner
      size="lg"
      class="fr-recognize-spinner" />
    <h2
      class="fr-recognize-screen__headline mt-4"
      tabindex="-1">
      {{ $t(`login.pingOneRecognize.serverComputation.${isEnrolment ? 'enroll' : 'auth'}Headline`) }}
    </h2>
    <p class="fr-recognize-screen__body text-muted">
      {{ $t('login.pingOneRecognize.serverComputation.body') }}
    </p>
  </div>
</template>

<script setup>
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';

defineProps({
  isEnrolment: {
    type: Boolean,
    required: true,
  },
});
</script>
