<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="custom-control custom-checkbox pb-1 mb-4">
    <input
      :disabled="uiSchema.disabled"
      :id="`checkbox-${path}`"
      type="checkbox"
      :name="`checkbox-${path}`"
      autocomplete="off"
      class="custom-control-input"
      v-model="checked">
    <label
      :for="`checkbox-${path}`"
      class="custom-control-label">
      {{ labelTranslation }}
      <small
        v-if="uiSchema.isHtml"
        v-html="descriptionTranslation"
        class="form-text text-muted" />
      <small
        v-else
        class="form-text text-muted">
        {{ descriptionTranslation }}
      </small>
    </label>
  </div>
</template>

<script>
import { getTranslation } from '@forgerock/platform-shared/src/utils/translations';

export default {
  name: 'BooleanDisplay',
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
    checked: {
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
