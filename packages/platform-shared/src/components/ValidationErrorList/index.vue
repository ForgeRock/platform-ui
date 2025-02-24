<!-- Copyright (c) 2019-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    role="alert"
    :class="`fr-validation-requirements text-left ${validatorErrors.length ? 'show' : ''}`"
    v-if="validatorErrors">
    <p
      v-for="(error, index) in validatorErrors"
      :data-testid="`${fieldName}-validation-error-${index}`"
      :id="getErrorId(index)"
      :key="error"
      class="text-danger mb-0 error-message">
      {{ error }}
    </p>
  </div>
</template>

<script>
import { createErrorId } from '@forgerock/platform-shared/src/utils/accessibilityUtils';
/**
 * Component for displaying error message for form fields
 */
export default {
  name: 'ValidationErrorList',
  props: {
    /**
     * List of validation errors
     */
    validatorErrors: {
      type: Array,
      default: () => [],
    },
    /**
     * Name of field
     */
    fieldName: {
      type: String,
      default: () => '',
    },
  },
  methods: {
    /**
     * Creates an id for the field error message.
     */
    getErrorId(index) {
      if (!this.fieldName) return '';

      return createErrorId(this.fieldName + index);
    },
  },
};
</script>
<style lang="scss" scoped>
.fr-validation-requirements {
  &.error-messages {
    max-height: 0px;
    overflow: hidden;
    transition: max-height 0.8s ease-in;

    &.show {
      height: auto;
      max-height: 30vh;
    }
  }
}
</style>
