<template>
  <div
    v-show="validatorErrors.has(fieldName)"
    class="fr-validation-requirements text-left">
    <span class="text-danger">
      {{ validatorErrors.first(fieldName) }}
    </span>
  </div>
</template>

<script>
/**
 * @description Component for displaying error message for form fields
 *
 * */
export default {
  name: 'ValidationError',
  props: {
    validatorErrors: {
      type: Object,
      default: () => ({}),
    },
    fieldName: {
      type: String,
      default: () => '',
    },
  },
};
</script>

<style lang="scss" scoped></style>
