<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    v-model="uiSchema.value"
    class="mb-4"
    type="number"
    :disabled="uiSchema.disabled"
    :description="uiSchema.description"
    :label="uiSchema.label"
    :validation="validation"
    @input="updateValue" />
</template>
<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'NumberDisplay',
  components: {
    FrField,
  },
  props: {
    uiSchema: {
      type: Object,
      default() {
        return {};
      },
    },
    saveModel: {
      type: String,
      default: '',
    },
  },
  computed: {
    validation() {
      return `numeric${this.uiSchema.required ? '|required' : ''}`;
    },
  },
  methods: {
    updateValue(value) {
      this.$emit('update:model', {
        model: this.saveModel,
        value,
      });
    },
  },
};
</script>
