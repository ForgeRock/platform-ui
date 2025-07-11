<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BCard
      class="form-section"
      no-body>
      <BCardHeader
        v-if="property.header"
        class="h5">
        {{ property.header }}
      </BCardHeader>
      <BCardBody class="px-4 pb-0">
        <FrFormBuilder
          :transform-schema="false"
          :form="{ fields: property.fields }"
          :model-value="model"
          :read-only="readOnly"
          @field-changed="emit('update:model', $event);"
          @is-valid="emit('is-valid', { sectionId: property.id, isValid: $event })" />
      </BCardBody>
      <BCardFooter v-if="property.footer">
        {{ property.footer }}
      </BCardFooter>
    </BCard>
  </div>
</template>

<script setup>
/**
 * This component is used to display a section in the form editor.
 * It is a wrapper around the FormBuilder component that allows for
 * displaying a section with a title, fields, and a footer.
 */
import {
  BCard,
  BCardBody,
  BCardFooter,
  BCardHeader,
} from 'bootstrap-vue';
import FrFormBuilder from '@forgerock/platform-shared/src/components/FormEditor/FormBuilder';

defineProps({
  property: {
    type: Object,
    default: () => ({}),
  },
  model: {
    type: Object,
    default: () => ({}),
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:model', 'is-valid']);
</script>
