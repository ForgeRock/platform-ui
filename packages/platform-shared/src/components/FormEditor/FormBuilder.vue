<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrFormGenerator
    :schema="schemaFormGenerator"
    :model="modelValue"
    @update:model="fieldChanged" />
</template>

<script setup>
import FrFormGenerator from '@forgerock/platform-shared/src/components/FormGenerator';
import { useForm } from 'vee-validate';
import { watch, ref } from 'vue';
import { transformSchemaToFormGenerator } from './utils/formGeneratorSchemaTransformer';

/**
* Component to build forms based on a schema, It is used to render the FormEditor generated schemas.
*/

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {},
  },
  schema: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'is-valid']);

const schemaFormGenerator = ref([]);
const { meta } = useForm();

watch(() => props.schema, (newVal) => {
  schemaFormGenerator.value = transformSchemaToFormGenerator(newVal);
}, { immediate: true });

watch(meta, (newVal) => {
  emit('is-valid', newVal.valid);
});

function fieldChanged({ path, value }) {
  emit('update:modelValue', {
    ...props.modelValue,
    [path]: value,
  });
}
</script>
