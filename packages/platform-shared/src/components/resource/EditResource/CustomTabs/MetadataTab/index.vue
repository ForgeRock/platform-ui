<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BTab :title="$t('common.metadata')">
    <FrField
      class="p-3"
      name="createDateField"
      type="datetime"
      :label="$t('common.createDate')"
      :adjust-for-timezone="false"
      :disabled="true"
      :show-seconds="false"
      :value="meta.createDate" />
    <FrField
      class="p-3"
      name="lastChangedField"
      type="datetime"
      :label="$t('common.lastChangedDate')"
      :adjust-for-timezone="false"
      :disabled="true"
      :show-seconds="false"
      :value="meta.lastChanged?.date" />
    <FrField
      class="p-3"
      :label="$t('common.loginCount')"
      :disabled="true"
      name="loginCountField"
      :value="meta.loginCount"
      type="number" />
  </BTab>
</template>

<script setup>
import { defineProps } from 'vue';
import { BTab } from 'bootstrap-vue';
import FrField from '@forgerock/platform-shared/src/components/Field';

defineProps({
  meta: {
    type: Object,
    default: () => ({}),
  },
});
</script>
