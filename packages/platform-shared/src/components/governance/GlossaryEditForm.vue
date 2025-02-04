<!-- Copyright 2023-2025 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <FrFormGenerator
      :schema="schema"
      :model="model"
      @update:model="emitGlossaryValueUpdateEvent">
      <template #objectSelect="{ property }">
        <FrGovObjectSelect
          class="pb-1 mb-4"
          :property="property"
          @update:model="emitGlossaryValueUpdateEvent" />
      </template>
      <template #objectMultiselect="{ property }">
        <FrGovObjectMultiselect
          class="pb-1 mb-4"
          :property="property"
          @update:model="emitGlossaryValueUpdateEvent" />
      </template>
    </FrFormGenerator>
  </div>
</template>

<script setup>
/**
 * Generic Glossary Form which displays fields based on glossary schema.
 * It has option to edit if there are glossary values previously saved.
 */
import { ref } from 'vue';
import { isArray, cloneDeep } from 'lodash';
import FrFormGenerator from '@forgerock/platform-shared/src/components/FormGenerator';
import FrGovObjectMultiselect from '@forgerock/platform-shared/src/components/FormEditor/components/governance/GovObjectMultiselect';
import FrGovObjectSelect from '@forgerock/platform-shared/src/components/FormEditor/components/governance/GovObjectSelect';

const props = defineProps({
  glossarySchema: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const model = ref({});
const schema = ref([]);

/**
 * Cleans up resources or performs necessary actions after an update.
 *
 * @param {Function} updateValue - The function to call for updating the value.
 */
function cleanup(updateValue) {
  Object.keys(updateValue).forEach((key) => {
    if (updateValue[key] === null || updateValue[key] === undefined || updateValue[key] === '') {
      delete updateValue[key];
    } else if (isArray(updateValue[key])) {
      if (updateValue[key] && updateValue[key].length === 0) {
        delete updateValue[key];
      }
    }
  });
  return updateValue;
}

/**
 * Emits an event to update the glossary value.
 *
 * @param {Object} param - The parameter object.
 * @param {string} param.path - The path of the glossary value to update.
 * @param {*} param.value - The new value to set for the glossary entry.
 */
function emitGlossaryValueUpdateEvent({ path, value }) {
  let updateValue = cloneDeep(props.modelValue);
  updateValue[path] = value;
  updateValue = cleanup(updateValue);
  emit('update:modelValue', updateValue);
}

/**
 * Retrieves the value for a multivalue field.
 *
 * @param {any} value - The value to be processed.
 * @returns {any} - The processed value for the multivalue field.
 */
function getValueForMultivalue(value) {
  if (value) return isArray(value) ? value : [value];
  return [];
}

/**
 * Builds a schema for the form generator based on the provided glossary schema.
 *
 * @param {Object} glossarySchema - The schema of the glossary to be used for generating the form schema.
 * @returns {Object} - The generated form schema.
 */
function buildSchemaForFormGenerator(glossarySchema) {
  schema.value = glossarySchema.map((attribute) => {
    const { type, managedObjectType } = attribute;
    let fieldType = type;
    let value = null;
    let options = [];
    let customSlot = '';
    let ifEnumeratedValuesExist;

    switch (type) {
      case 'string':
      case 'int':
      case 'integer':
        ifEnumeratedValuesExist = attribute.enumeratedValues && attribute.enumeratedValues.length > 0;
        if (ifEnumeratedValuesExist && attribute.isMultiValue) {
          fieldType = 'multiselect';
          options = attribute.enumeratedValues;
          value = props.modelValue[attribute.name] || [];
        } else if (ifEnumeratedValuesExist && !attribute.isMultiValue) {
          fieldType = 'select';
          options = attribute.enumeratedValues;
          value = props.modelValue[attribute.name] || '';
        } else if (!ifEnumeratedValuesExist && attribute.isMultiValue) {
          fieldType = 'array';
          options = [];
          value = getValueForMultivalue(props.modelValue[attribute.name]);
        } else {
          const isAttributeNumericType = attribute.type === 'int' || attribute.type === 'integer';
          fieldType = isAttributeNumericType ? 'integer' : 'string';
          value = props.modelValue[attribute.name];
        }
        break;
      case 'boolean':
      case 'date':
        value = props.modelValue[attribute.name];
        break;
      case 'managedObject':
        fieldType = 'string';
        options = { object: managedObjectType.split('/').pop() };
        if (attribute.isMultiValue) {
          customSlot = 'objectMultiselect';
          value = getValueForMultivalue(props.modelValue[attribute.name]);
        } else {
          customSlot = 'objectSelect';
          value = props.modelValue[attribute.name] || '';
        }
        break;
      default:
        break;
    }

    return [{
      label: attribute.displayName,
      model: attribute.name,
      type: fieldType,
      options,
      value,
      customSlot,
      allowEmpty: true,
      disabled: props.readOnly,
    }];
  });
}

buildSchemaForFormGenerator(props.glossarySchema);
</script>
