<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BFormGroup
    :label="labelTranslation"
    class="pb-1 mb-4">
    <BFormRadioGroup
      v-if="uiSchema.format && uiSchema.format === 'buttons'"
      v-model="value"
      buttons
      button-variant="outline-primary"
      :options="uiSchema.options"
      size="md"
      text-field="text" />
    <BFormRadioGroup
      v-else
      v-model="value"
      :options="uiSchema.options"
      stacked
      text-field="text" />
    <small
      v-if="uiSchema.isHtml"
      v-html="descriptionTranslation"
      class="form-text text-muted" />
    <small
      v-else
      class="form-text text-muted">
      {{ descriptionTranslation }}
    </small>
  </BFormGroup>
</template>

<script>
import {
  BFormGroup,
  BFormRadioGroup,
} from 'bootstrap-vue';
import { getTranslation } from '@forgerock/platform-shared/src/utils/translations';

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
    descriptionTranslation() {
      return getTranslation(this.uiSchema.description);
    },
    labelTranslation() {
      return getTranslation(this.uiSchema.label);
    },
  },
};
</script>
