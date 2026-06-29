<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <template
    v-for="property in schema"
    :key="property.key">
    <FrKeyValueField
      v-if="property.type === 'object'"
      class="mb-4"
      is-html
      :name="property.key"
      :label="sanitizeLabel(property.title)"
      :description="sanitize(property.description)"
      :value="value[property.key]"
      :validation="{
        required: !disableRequiredValidation && property.required,
        ...property.validation,
      }"
      @input="$emit('input', { ...value, [property.key]: $event })" />
    <FrField
      v-else
      class="mb-4"
      is-html
      :name="property.key"
      :value="value[property.key]"
      :type="getFieldTypeForProperty(property)"
      :label="sanitizeLabel(property.title)"
      :description="sanitize(property.description)"
      :options="getSelectFieldOptions(property)"
      :validation="{
        required: !disableRequiredValidation && property.required,
        ...property.validation,
      }"
      @input="$emit('input', { ...value, [property.key]: $event })" />
  </template>
</template>

<script setup>
import { provide } from 'vue';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrKeyValueField from '@forgerock/platform-shared/src/components/KeyValueField/KeyValueField';
import {
  getFieldTypeForProperty,
  getSelectFieldOptions,
} from '@forgerock/platform-shared/src/utils/amSchemaUtils';
import { sanitize } from '@forgerock/platform-shared/src/utils/sanitizerConfig';

/**
 * Prepares an AM schema label for safe v-html rendering with correct entity display.
 * Pipeline: decode → sanitize → decode.
 * - First decode converts source entities (e.g. `&amp;`) to real characters so
 *   sanitize-html sees the actual markup and can strip dangerous tags.
 * - Sanitize removes any malicious markup (e.g. `<img onerror=…>`).
 * - Second decode converts the benign entities that sanitize-html re-introduces
 *   for text characters (e.g. `&amp;` → `&`) so they display correctly in v-html.
 *   This is safe because dangerous markup was already stripped in the previous step.
 * @param {string} label - Raw label string from AM schema
 * @returns {string} Sanitized label with entities decoded for correct display
 */
function sanitizeLabel(label) {
  if (!label) return '';
  const decode = (str) => new DOMParser().parseFromString(str, 'text/html').body.textContent;
  return decode(sanitize(decode(label)));
}

// AM-style placeholder fields are displayed as read-only text — no clear button
provide('showClearField', false);

defineProps({
  /** Processed AM schema array produced by createAmForm. Each entry must have a `key` property. */
  schema: {
    type: Array,
    required: true,
  },
  /** Current field values keyed by schema key. Supports v-model via Vue 2 compat value/input contract. */
  value: {
    type: Object,
    required: true,
  },
  /** Suppresses required validation — useful when the fields rendered is used inside a larger validated form. */
  disableRequiredValidation: {
    type: Boolean,
    required: false,
    default: false,
  },
});

defineEmits(['input']);
</script>
