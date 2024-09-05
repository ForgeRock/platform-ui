<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      class="pb-1 mb-4"
      :autocomplete="uiSchema.autocomplete || ''"
      :copy="uiSchema.append"
      :disabled="uiSchema.disabled"
      :description="uiSchema.description"
      :is-html="uiSchema.isHtml"
      :label="uiSchema.label"
      :name="uiSchema.label || uiSchema.id"
      :readonly="uiSchema.readonly"
      type="textarea"
      :validation="uiSchema.validation"
      :value="uiSchema.value"
      @input="valueChange" />
  </div>
</template>

<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'TextAreaDisplay',
  components: {
    FrField,
  },
  props: {
    /**
     * Path to property in model
     */
    path: {
      type: String,
      default: '',
    },
    /**
     * Schema for field
     */
    uiSchema: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    valueChange(value) {
      if (!this.uiSchema.disabled) {
        this.$emit('update:model', {
          path: this.path,
          value,
        });
      }
    },
  },
};
</script>
