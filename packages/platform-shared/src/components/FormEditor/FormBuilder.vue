<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrFormGenerator
    :schema="schemaFormGenerator"
    :model="modelValue"
    @update:model="fieldChanged">
    <template #formText="{ property }">
      <div
        class="pb-1 mb-4"
        tab-index="0">
        {{ property.formText }}
      </div>
    </template>
    <template #objectSelect="{ property }">
      <FrGovObjectSelect
        v-if="store.state.SharedStore.governanceEnabled"
        class="pb-1 mb-4"
        :property="property"
        @update:model="fieldChanged" />
    </template>
    <template #objectMultiselect="{ property }">
      <FrGovObjectMultiselect
        v-if="store.state.SharedStore.governanceEnabled"
        class="pb-1 mb-4"
        :property="property"
        @update:model="fieldChanged" />
    </template>
  </FrFormGenerator>
</template>

<script setup>
import FrFormGenerator from '@forgerock/platform-shared/src/components/FormGenerator';
import { cloneDeep, set } from 'lodash';
import { useForm } from 'vee-validate';
import { watch, ref } from 'vue';
import { transformSchemaToFormGenerator } from './utils/formGeneratorSchemaTransformer';
import FrGovObjectMultiselect from './components/governance/GovObjectMultiselect';
import FrGovObjectSelect from './components/governance/GovObjectSelect';
import store from '@/store';

/**
* Component to build forms based on a schema, It is used to render the FormEditor generated schemas.
*/

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {},
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  schema: {
    type: Array,
    default: () => [],
  },
  includeDefaults: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'is-valid']);

const schemaFormGenerator = ref([]);
const { meta } = useForm();

watch(() => props.schema, (newVal) => {
  schemaFormGenerator.value = transformSchemaToFormGenerator(newVal, props.readOnly, props.includeDefaults);
}, { immediate: true });

watch(meta, (newVal) => {
  emit('is-valid', newVal.valid);
});

function fieldChanged({ path, value }) {
  const emitValue = cloneDeep(props.modelValue);
  set(emitValue, path, value);
  emit('update:modelValue', emitValue);
}
</script>
