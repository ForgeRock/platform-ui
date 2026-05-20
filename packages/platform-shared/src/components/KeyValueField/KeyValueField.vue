<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <label class="w-100 mb-1">{{ label }}</label>
    <p
      v-if="description && isHtml"
      class="text-muted small mb-2"
      v-html="description" />
    <p
      v-else-if="description"
      class="text-muted small mb-2">
      {{ description }}
    </p>
    <FrKeyValueList
      v-bind="$attrs"
      :value="value"
      v-on="$listeners" />
  </div>
</template>

<script setup>
import FrKeyValueList from '@forgerock/platform-shared/src/components/Field/KeyValueList';

defineProps({
  /** Field label shown above the key-value list. */
  label: {
    type: String,
    default: '',
  },
  /** Optional description shown below the label. Rendered as HTML only when `isHtml` is true. */
  description: {
    type: String,
    default: '',
  },
  /** When true, renders the description via v-html (caller is responsible for sanitization). */
  isHtml: {
    type: Boolean,
    default: false,
  },
  /** Current key-value object; supports v-model via Vue 2 compat value/input contract. */
  value: {
    type: Object,
    default: () => ({}),
  },
});

defineEmits(['input']);
</script>
