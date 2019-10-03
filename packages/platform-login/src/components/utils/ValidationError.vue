<template>
  <div
    v-show="validatorErrors.length"
    class="fr-validation-requirements text-left">
    <p
      v-for="(error) in validatorErrors"
      :key="error"
      class="text-danger mb-0">
      {{ error }}
    </p>
  </div>
</template>

<script>
// TODO Add to components
/**
 * @description Component for displaying error message for form fields
 *
 * */
export default {
  name: 'ValidationError',
  props: {
    validatorErrors: {
      type: Array,
      default: () => [],
    },
    fieldName: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped></style>
