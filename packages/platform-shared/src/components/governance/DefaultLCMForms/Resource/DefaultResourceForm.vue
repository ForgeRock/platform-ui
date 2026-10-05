<!-- Copyright (c) 2025-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrSpinner
      v-if="isLoading"
      class="py-5" />
    <FrFormGenerator
      v-else
      :default-value-for-integer="null"
      :schema="schemaFormGenerator"
      :model="modelValue"
      @update:model="fieldChanged" />
  </div>
</template>

<script setup>
/**
 * Displays the details tab for a resource.
 * Renders the resource's object-type schema as an editable, two-column form
 * (mirroring the Modify User form), prefilled with the resource's current values.
 * Saving submits a request to modify the resource.
 */
import { ref } from 'vue';
import { intersection } from 'lodash';
import FrFormGenerator from '@forgerock/platform-shared/src/components/FormGenerator';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner';
import { getObjectTypeSchema } from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const emit = defineEmits(['update:resourceValues']);

const props = defineProps({
  applicationId: {
    type: String,
    required: true,
  },
  resource: {
    type: Object,
    default: () => ({}),
  },
  objectType: {
    type: String,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const isLoading = ref(true);
const modelValue = ref({});
const schemaFormGenerator = ref([]);

/**
 * Returns the FormGenerator type for a given schema property type.
 * @param {String} propertyType - The schema property type.
 * @returns {String} The FormGenerator field type.
 */
function getType(propertyType) {
  switch (propertyType) {
    case 'boolean':
    case 'array':
      return propertyType;
    case 'number':
      return 'integer';
    case 'date':
    case 'datetime':
      return 'date';
    default:
      return 'string';
  }
}

/**
 * Returns the default value for a field based on its type.
 * @param {*} value - The current value.
 * @param {String} type - The field type.
 * @returns {*} The default value.
 */
function getDefaultValue(value, type) {
  switch (type) {
    case 'array':
      return value ?? [];
    case 'boolean':
      return value ?? false;
    default:
      return value ?? null;
  }
}

/**
 * Builds the FormGenerator schema from the object-type schema, and splits
 * the fields into rows of two for the two-column layout.
 * @param {Object} objectTypeSchema - The schema of the resource's object type.
 * @param {Object} resourceObject - The resource's current values.
 * @returns {Array} - The FormGenerator schema, one row (array of up to 2 fields) at a time.
 */
function buildSchemaForFormGenerator(objectTypeSchema, resourceObject) {
  const fields = Object.keys(objectTypeSchema.properties).map((key) => {
    const property = objectTypeSchema.properties[key];
    const isNotUpdateable = intersection(property.flags || [], ['NOT_UPDATEABLE']).length > 0;
    const type = getType(property.type);

    return {
      label: property.displayName || key,
      model: key,
      type,
      value: getDefaultValue(resourceObject[key], type),
      disabled: props.readOnly || isNotUpdateable || property.type === 'relationship',
    };
  }).sort((a, b) => ((objectTypeSchema.properties[a.model].order ?? 0) - (objectTypeSchema.properties[b.model].order ?? 0)));

  // split into two columns
  const rows = [];
  const size = 2;
  while (fields.length > 0) rows.push(fields.splice(0, size));
  return rows;
}

/**
 * Fetches the object-type schema for the resource and prepares the editable form.
 */
async function getResourceDetails() {
  isLoading.value = true;
  try {
    const { data: objectTypeSchema } = await getObjectTypeSchema(props.applicationId, props.objectType);
    const resourceObject = props.resource || {};
    modelValue.value = { ...resourceObject };
    schemaFormGenerator.value = buildSchemaForFormGenerator(objectTypeSchema, resourceObject);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('governance.accessRequest.errorGettingResource'));
  } finally {
    isLoading.value = false;
  }
}

/**
 * Handles the event triggered when a field value changes in the form.
 * @param {Event} event - The event object containing details about the field change.
 */
function fieldChanged(event) {
  modelValue.value[event.path] = event.value;
  const field = schemaFormGenerator.value.flat().find((f) => f.model === event.path);
  if (field) field.value = event.value;
  emit('update:resourceValues', modelValue.value);
}

getResourceDetails();
</script>
