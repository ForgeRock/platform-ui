<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrField
    v-model="field"
    class="mb-4"
    type="password"
    :disabled="uiSchema.disabled"
    :description="uiSchema.description"
    :label="uiSchema.label" />
</template>

<script>
import FrField from '@forgerock/platform-shared/src/components/Field';

export default {
  name: 'PasswordDisplay',
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
    path: {
      type: String,
      default: '',
    },
  },
  computed: {
    field: {
      get() {
        return this.uiSchema.value || '';
      },
      set(newValue) {
        this.$emit('update:model', {
          path: this.path,
          value: newValue,
        });
      },
    },
  },
};
</script>
