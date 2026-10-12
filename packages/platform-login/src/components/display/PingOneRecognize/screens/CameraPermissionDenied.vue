<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-recognize-screen">
    <h2
      class="fr-recognize-screen__headline"
      tabindex="-1">
      {{ $t('login.pingOneRecognize.cameraPermissionDenied.headline') }}
    </h2>
    <FrAlert
      class="fr-recognize-alert w-100"
      :show="true"
      :dismissible="false"
      variant="warning">
      {{ $t('login.pingOneRecognize.cameraPermissionDenied.alertBody') }}
    </FrAlert>
    <p class="fr-recognize-screen__body text-muted">
      {{ $t('login.pingOneRecognize.cameraPermissionDenied.body') }}
    </p>
    <BButton
      variant="primary"
      class="mt-3"
      @click="$emit('reload')">
      {{ $t('login.pingOneRecognize.cameraPermissionDenied.continue') }}
    </BButton>
  </div>
</template>

<script setup>
import { BButton } from 'bootstrap-vue';
import FrAlert from '@forgerock/platform-shared/src/components/Alert';

defineEmits(['reload']);
</script>
