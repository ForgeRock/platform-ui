<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    class="text-center">
    <div
      :class="[{ 'spinner-large': size === 'lg' }, { 'spinner-medium': size === 'md' }, { 'spinner-small': size === 'sm' }, 'spinner-border', { 'text-primary': !buttonSpinner }]"
      role="status">
      <span class="sr-only">
        Loading...
      </span>
    </div>
  </div>
</template>

<script>
/**
 * Spinners are loading indicators that should be shown when retrieving data or performing slow computations.
 */
export default {
  name: 'Spinner',
  props: {
    /**
     * Size of the spinner. Available sizes: sm, lg.
     */
    size: {
      type: String,
      default: 'lg',
    },
    /**
     * Indicates that the spinner being used in a button, where it should inherit colour styling.
     */
    buttonSpinner: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style lang="scss">
.spinner-large {
  width: 10rem;
  height: 10rem;
}

.spinner-medium {
  width: 3rem;
  height: 3rem;
}

.spinner-small {
  width: 1rem;
  height: 1rem;
  border-width: 0.2em;
}
</style>
