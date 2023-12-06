<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    v-model="fieldOptionsModel"
    class="mb-3"
    close-on-select
    testid="default-run-report-field"
    :internal-search="false"
    :label="label"
    :name="name"
    :options="fieldOptions"
    :placeholder="placeholder"
    :type="fieldOptions.length ? 'multiselect' : 'string'" />
</template>

<script setup>
/**
 * @description Default field for running reports
 */
import { ref, watch } from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';

defineProps({
  fieldOptions: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['field-value-update']);

const fieldOptionsModel = ref([]);
watch(fieldOptionsModel, (value) => {
  let arrVal = value;

  if (typeof value === 'string') {
    arrVal = value ? [value] : [];
  }
  emit('field-value-update', arrVal);
});
</script>
