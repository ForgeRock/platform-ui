<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BFormGroup
    :label="uiSchema.label">
    <BFormRadioGroup
      v-model="value"
      :options="uiSchema.options"
      text-field="text"
      stacked />
    <small
      v-if="uiSchema.isHtml"
      v-html="uiSchema.description"
      class="form-text text-muted" />
    <small
      v-else
      class="form-text text-muted">
      {{ uiSchema.description }}
    </small>
  </BFormGroup>
</template>

<script>
import {
  BFormGroup,
  BFormRadioGroup,
} from 'bootstrap-vue';

export default {
  name: 'RadioDisplay',
  components: {
    BFormGroup,
    BFormRadioGroup,
  },
  props: {
    /**
     * Schema for field
     */
    uiSchema: {
      type: Object,
      default() {
        return {};
      },
    },
    /**
     * Path to property in model
     */
    path: {
      type: String,
      default: '',
    },
  },
  computed: {
    value: {
      get() {
        return this.uiSchema.value;
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
