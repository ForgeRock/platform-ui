<!-- Copyright (c) 2021-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<!-- TODO: Once template change is merged: Remove || uiSchema.model === 'coreOAuth2ClientConfig.url' -->
<template>
  <FrField
    :can-enter-placeholders="uiSchema.canEnterPlaceholders || uiSchema.model === 'coreOAuth2ClientConfig.url'"
    class="pb-1 mb-4"
    :autocomplete="uiSchema.autocomplete || ''"
    :copy="uiSchema.append"
    :disabled="uiSchema.disabled"
    :description="uiSchema.description"
    :include-secrets="uiSchema.includeSecrets ?? true"
    :coerce-placeholder="false"
    :is-html="uiSchema.isHtml"
    :label="uiSchema.label"
    :name="fieldName"
    :validation="uiSchema.validation"
    :value="uiSchema.value"
    :readonly="uiSchema.readonly"
    :error-message="errorMessage"
    @input="valueChange" />
</template>

<script>
import FrField from '@forgerock/platform-shared/src/components/Field';
import { useField } from 'vee-validate';

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
    /**
     * Name property to use for the field
     * If not provided, it will default to uiSchema.label or uiSchema.id
     */
    nameProp: {
      type: String,
      default: '',
    },
  },
  computed: {
    fieldName() {
      return this.nameProp ? this.uiSchema[this.nameProp] : this.uiSchema.label || this.uiSchema.id;
    },
  },
  setup(props) {
    // Use useField to connect to vee-validate. We use path to ensure name is unique
    const { errorMessage, handleChange } = useField(props.path, props.uiSchema.validation);

    return {
      errorMessage,
      handleChange,
    };
  },
  methods: {
    /**
     * Handles changes to the input value
     * @param {string} value The new value
     */
    valueChange(value) {
      if (!this.uiSchema.disabled) {
        this.handleChange(value); // Update vee-validate's internal state for this field
        this.$emit('update:model', {
          path: this.path,
          value,
        });
      }
    },
  },
};
</script>
