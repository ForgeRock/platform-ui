<!-- Copyright (c) 2019-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    role="alert"
    class="fr-validation-requirements text-left"
    v-if="validatorErrors">
    <template v-if="validatorErrors.length || validatorErrors.length === 0">
      <p
        v-for="(error) in validatorErrors"
        :key="error"
        class="text-danger mb-0 error-message">
        {{ error }}
      </p>
    </template>
    <p
      v-else
      class="text-danger error-message">
      {{ validatorErrors.first(fieldName) }}
    </p>
  </div>
</template>

<script>
/**
 * @description Component for displaying error message for form fields
 */
export default {
  name: 'ValidationErrorList',
  props: {
    validatorErrors: {
      type: [Array, Object],
      default: () => {},
    },
    fieldName: {
      type: String,
      default: () => '',
    },
  },
};
</script>
