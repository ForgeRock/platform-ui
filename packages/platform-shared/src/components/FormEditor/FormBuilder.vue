<!-- Copyright (c) 2024-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrFormGenerator
    field-name-prop="id"
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
import {
  onBeforeUnmount,
  nextTick,
  ref,
  watch,
} from 'vue';
import {
  cloneDeep,
  debounce,
  isEqual,
  get,
  set,
} from 'lodash';
import { useForm } from 'vee-validate';
import FrFormGenerator from '@forgerock/platform-shared/src/components/FormGenerator';
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

const { meta } = useForm();
const emit = defineEmits(['update:modelValue', 'is-valid']);

const schemaFormGenerator = ref([]);
const updatedModelValue = ref(props.modelValue);
let isEventUpdate = false;

/**
 * Handles the change event for a form input.
 *
 * @param {Object} event - The event object triggered by the input change.
 * @param {*} value - The new value of the input after the change.
 * @param {String} key - The key of the form field that was changed.
 * @returns {Promise<void>} A promise that resolves when the event handling is complete.
 */
async function handleOnChangeEvent(event, value, key) {
  if (event?.script) {
    try {
      // execute the script
      const { formValues, formSchema } = await useWebWorker(
        event.script,
        updatedModelValue.value,
        schemaFormGenerator.value,
        { newFieldValue: value },
      );
      if (isEqual(value, get(updatedModelValue.value, key))) {
        isEventUpdate = true;
        schemaFormGenerator.value = formSchema;
        updatedModelValue.value = formValues;
        emit('update:modelValue', updatedModelValue.value);
        nextTick(() => {
          // this ensures that events do not trigger other events
          isEventUpdate = false;
        });
        return;
      }
    } catch (error) {
      showErrorMessage(null, error);
      isEventUpdate = false;
    }
  }
}

const debounceHandleOnChangeEvent = debounce(handleOnChangeEvent, 200);

/**
 * Returns an event handler function for handling changes to a specific form field.
 *
 * @param {string} key - The unique identifier for the form field.
 * @param {Array} formFields - Array of fields in the form schema.
 * @returns {Function} Event handler function to be used as an onChange callback for the field.
 */
function getFieldOnChangeEvent(key, formFields) {
  let event = null;
  formFields.forEach((field) => {
    const changedField = field.fields.find((f) => f.model === key);
    if (changedField?.onChangeEvent) event = changedField.onChangeEvent;
  });
  return event;
}

/**
 * Handles changes to a form field.
 *
 * @param {string} param.path - The path to the changed field within the form data.
 * @param {*} param.value - The new value of the field.
 * @returns {Promise<void>} A promise that resolves when the field change has been processed.
 */
async function fieldChanged({ path, value }) {
  if (!isEventUpdate) {
    const changeEvent = getFieldOnChangeEvent(path, props.form.fields);
    if (changeEvent) await debounceHandleOnChangeEvent(changeEvent, value, path);
  }

  const emitValue = cloneDeep(updatedModelValue.value);
  set(emitValue, path, value);
  emit('update:modelValue', emitValue);
}

watch(() => props.form, async (newVal) => {
  schemaFormGenerator.value = transformSchemaToFormGenerator(newVal?.fields, props.readOnly, props.includeDefaults);

  // check for onLoad event script in the form
  if (props.form?.events?.onLoad?.script) {
    try {
      const { formValues, formSchema } = await useWebWorker(props.form?.events?.onLoad?.script, updatedModelValue.value, schemaFormGenerator.value);
      schemaFormGenerator.value = formSchema;
      updatedModelValue.value = formValues;
      emit('update:modelValue', updatedModelValue.value);
    } catch (error) {
      showErrorMessage(null, error);
    }
  }
}, { immediate: true, deep: true });

watch(meta, (newVal) => {
  emit('is-valid', newVal.valid);
});

watch(() => props.modelValue, (newVal, oldVal) => {
  if (isEqual(newVal, oldVal)) return;
  updatedModelValue.value = cloneDeep(newVal);
}, { immediate: true, deep: true });

onBeforeUnmount(() => {
  debounceHandleOnChangeEvent.cancel();
});
</script>
