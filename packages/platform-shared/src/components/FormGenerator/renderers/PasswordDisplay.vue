<!-- Copyright (c) 2021-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    v-model="uiSchema.value"
    class="pb-1 mb-4"
    type="password"
    :disabled="uiSchema.disabled"
    :description="uiSchema.description"
    :label="uiSchema.label"
    :validation="uiSchema.validation"
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
