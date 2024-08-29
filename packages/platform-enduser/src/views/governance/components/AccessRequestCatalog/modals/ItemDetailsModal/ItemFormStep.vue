<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrFormBuilder
      @update:model-value="handleInput"
      @is-valid="emit('is-valid', $event);"
      :model-value="formValue"
      :schema="formDefinition.form?.fields"
      include-defaults />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { getInitialModel } from '@forgerock/platform-shared/src/components/FormEditor/utils/formGeneratorSchemaTransformer';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';
/**
 * Component to show the request form of an item in the ItemDetailsModal.
 */

const props = defineProps({
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

watch(
  props.formDefinition,
  (newVal) => { formValue.value = getInitialModel(newVal.form?.fields, true); },
  { immediate: true, deep: true },
);

function handleInput(value) {
  formValue.value = value;
  emit('input', value);
}

</script>
