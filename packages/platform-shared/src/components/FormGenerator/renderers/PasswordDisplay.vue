<!-- Copyright (c) 2021-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    class="pb-1 mb-4"
    type="password"
    :autocomplete="uiSchema.autocomplete || ''"
    :disabled="uiSchema.disabled"
    :description="uiSchema.description"
    :label="uiSchema.label"
    :name="nameProp ? uiSchema[nameProp] : uiSchema.label || uiSchema.id"
    :validation="uiSchema.validation"
    :value="uiSchema.value"
    @input="valueChange" />
</template>

<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'PasswordDisplay',
  components: {
    FrField,
  },
  props: {
    /**
     * Schema for field
     */
    uiSchema: {
      type: Object,
      default: () => ({}),
    },
    /**
     * Path to property in model
     */
    path: {
      type: String,
      default: '',
    },
    /**
     * Name property to use for the field
     * If not provided, it will default to uiSchema.label or uiSchema.id
     */
    nameProp: {
      type: String,
      default: '',
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
