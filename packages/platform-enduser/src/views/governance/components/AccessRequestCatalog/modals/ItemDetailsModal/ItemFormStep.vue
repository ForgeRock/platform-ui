<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrFormBuilder
      @update:model-value="handleInput"
      @is-valid="emit('is-valid', $event);"
      :model-value="formValue"
      :schema="formDefinition.form?.fields" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';
/**
 * Component to show the request form of an item in the ItemDetailsModal.
 */

defineProps({
  formDefinition: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits([
  'input',
  'is-valid',
]);

const formValue = ref({});

function handleInput(value) {
  formValue.value = value;
  emit('input', value);
}

</script>
