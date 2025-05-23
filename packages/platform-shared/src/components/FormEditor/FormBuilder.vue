<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrFormGenerator
    :schema="schemaFormGenerator"
    :model="updatedModelValue"
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
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { transformSchemaToFormGenerator } from './utils/formGeneratorSchemaTransformer';
import { useWebWorker } from './utils/formEvents';
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
  form: {
    type: Object,
    default: () => ({
      events: {},
      fields: [],
    }),
  },
  includeDefaults: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'is-valid']);

const schemaFormGenerator = ref([]);
const { meta } = useForm();
const updatedModelValue = ref(props.modelValue);

watch(() => props.form, async (newVal) => {
  schemaFormGenerator.value = transformSchemaToFormGenerator(newVal?.fields, props.readOnly, props.includeDefaults);
  if (props.form?.events?.onLoad?.script) {
    try {
      await useWebWorker(props.form.events.onLoad.script, updatedModelValue.value, schemaFormGenerator.value);
    } catch (error) {
      showErrorMessage(null, error);
    }
  }
}, { immediate: true, deep: true });

watch(meta, (newVal) => {
  emit('is-valid', newVal.valid);
});

watch(() => props.modelValue, (newVal) => {
  updatedModelValue.value = cloneDeep(newVal);
}, { immediate: true, deep: true });

function fieldChanged({ path, value }) {
  const emitValue = cloneDeep(updatedModelValue.value);
  set(emitValue, path, value);
  emit('update:modelValue', emitValue);
}
</script>
