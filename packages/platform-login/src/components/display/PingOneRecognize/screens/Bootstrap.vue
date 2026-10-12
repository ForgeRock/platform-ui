<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-recognize-screen">
    <FrSpinner
      size="lg"
      class="fr-recognize-spinner" />
    <p
      class="fr-recognize-screen__body fr-recognize-bootstrap__message"
      role="status">
      {{ $t('login.pingOneRecognize.bootstrap.message') }}
    </p>
  </div>
</template>

<script setup>
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
</script>
