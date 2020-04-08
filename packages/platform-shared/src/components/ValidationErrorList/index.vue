<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
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
