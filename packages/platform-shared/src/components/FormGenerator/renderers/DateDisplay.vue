<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    class="pb-1 mb-4"
    type="date"
    :disabled="uiSchema.disabled"
    :description="uiSchema.description"
    :label="uiSchema.label"
    :name="uiSchema.label || uiSchema.id"
    :validation="uiSchema.validation"
    :value="uiSchema.value"
    @input="updateValue" />
</template>
<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'DateDisplay',
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
    updateValue(value) {
      this.$emit('update:model', {
        path: this.path,
        value,
      });
    },
  },
};
</script>
<style scoped>
:deep(.date-button) {
  height: auto;
}
</style>
