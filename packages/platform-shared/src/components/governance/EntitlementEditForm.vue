<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrFormGenerator
      :default-value-for-integer="null"
      :schema="schema"
      :model="model"
      @update:model="updateModel" />
  </div>
</template>
<script setup>
/**
 * Displays a form for editing the object properties of an entitlement.
 */
import { ref, onMounted } from 'vue';
import FrFormGenerator from '@forgerock/platform-shared/src/components/FormGenerator';

const props = defineProps({
  entitlementSchema: {
    type: Object,
    default: () => ({}),
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

function updateModel({ path, value }) {
  model.value[path] = value;
  emit('update:modelValue', model.value);
}

/**
 * Returns the default value based on the provided type.
 * @param {any} value - The initial value to be processed.
 * @param {string} type - The type that determines the default value.
 * @returns {any} - The default value based on the type.
 */
function getDefaultValue(value, type) {
  switch (type) {
    case 'array':
      return value ?? [];
    case 'string':
    case 'integer':
    case 'boolean':
    default:
      return value ?? null;
  }
}

/**
 * Retrieves the type from the given schema type.
 *
 * @param {Object} schemaType - The schema type object to extract the type from.
 * @returns {string} The extracted type from the schema type object.
 */
function getType(schemaType) {
  switch (schemaType) {
    case 'string':
    case 'boolean':
    case 'array':
      return schemaType;
    case 'number':
      return 'integer';
    default:
      return 'string';
  }
}

/**
 * Builds a schema for the form generator based on the provided entitlement schema and model value.
 *
 * @param {Object} entitlementSchema - The schema defining the structure and rules for the entitlement form.
 * @param {Object} modelValue - The current values of the form model.
 * @returns {Object} - The schema formatted for use with the form generator.
 */
function buildSchemaForFormGenerator(entitlementSchema, modelValue) {
  schema.value = Object.keys(entitlementSchema).map((key) => {
    const propertySchema = entitlementSchema[key];
    const type = getType(propertySchema.type);
    return [{
      label: propertySchema.displayName,
      model: key,
      type,
      value: getDefaultValue(modelValue[key], type),
      disabled: props.readOnly,
    }];
  }).sort((a, b) => (entitlementSchema[a[0].model].order - entitlementSchema[b[0].model].order));
}

onMounted(() => {
  buildSchemaForFormGenerator(props.entitlementSchema, props.modelValue);
  model.value = props.modelValue;
});
</script>
