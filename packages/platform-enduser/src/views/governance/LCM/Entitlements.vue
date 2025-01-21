<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BContainer class="my-5">
    <FrHeader
      class="mb-4"
      :title="$t('governance.administer.entitlements.title')"
      :subtitle="$t('governance.administer.entitlements.subtitle')" />
  </BContainer>
</template>

<script setup>
import {
  BContainer,
} from 'bootstrap-vue';
import FrHeader from '@forgerock/platform-shared/src/components/PageHeader';
</script>
