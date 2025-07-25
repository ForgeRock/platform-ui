<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BCard>
    <h1 class="h5 mb-4">
      {{ i18n.global.t('governance.accounts.details.objectPropertiesTab.title') }}
    </h1>
    <BRow
      v-for="(detail, name) in objectProperties"
      :key="name"
      :name="`property-${name}`">
      <BCol
        sm="4"
        class="weight-600">
        {{ name }}
      </BCol>
      <BCol
        sm="8"
        class="mb-3 text-gray-900">
        {{ detail || blankValueIndicator }}
      </BCol>
    </BRow>
  </BCard>
</template>

<script setup>
import { BCard, BCol, BRow } from 'bootstrap-vue';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import i18n from '@/i18n';

/**
  * Account object properties display component
  */
defineProps({
  objectProperties: {
    type: Object,
    required: true,
  },
});

</script>
<style lang="scss" scoped>

.weight-600 {
  font-weight: 600;
}
.text-gray-900 {
  color: $gray-900
}

</style>
