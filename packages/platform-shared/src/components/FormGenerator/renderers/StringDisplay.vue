<!-- Copyright (c) 2021-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrField
      v-model="uiSchema.value"
      class="pb-1 mb-4"
      :copy="uiSchema.append"
      :disabled="uiSchema.disabled"
      :description="uiSchema.description"
      :is-html="uiSchema.isHtml"
      :label="uiSchema.label"
      :validation="uiSchema.validation"
      @input="valueChange" />
  </div>
</template>

<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'StringDisplay',
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
