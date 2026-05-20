<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <template
      v-for="property in schema"
      :key="property.key">
      <FrKeyValueField
        v-if="property.type === 'object'"
        class="mb-4"
        is-html
        :name="property.key"
        :label="sanitize(property.title)"
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
        :key="property.key"
        :name="property.key"
        :value="value[property.key]"
        :type="getFieldTypeForProperty(property)"
        :label="sanitize(property.title)"
        :description="sanitize(property.description)"
        :options="getSelectFieldOptions(property)"
        :validation="{
          required: !disableRequiredValidation && property.required,
          ...property.validation,
        }"
        @input="$emit('input', { ...value, [property.key]: $event })" />
    </template>
  </div>
</template>

<script setup>
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrKeyValueField from '@forgerock/platform-shared/src/components/KeyValueField/KeyValueField';
import {
  getFieldTypeForProperty,
  getSelectFieldOptions,
} from '@forgerock/platform-shared/src/utils/amSchemaUtils';
import { sanitize } from '@forgerock/platform-shared/src/utils/sanitizerConfig';

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
