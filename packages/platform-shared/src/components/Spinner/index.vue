<!-- Copyright (c) 2020-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="text-center">
    <div
      :class="[{ 'spinner-large': size === 'lg' }, { 'spinner-medium': size === 'md' }, { 'spinner-small': size === 'sm' }, 'spinner-border', { 'spinner-primary': !buttonSpinner }]"
      :data-testid="testid"
      aria-busy="true"
      role="status">
      <span class="sr-only">
        {{ $t('common.loadingEtc') }}
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
     * Size of the spinner.
     * @values sm, md, lg
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
    testid: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss">
.spinner-large {
  width: 10rem !important;
  height: 10rem !important;
}

.spinner-medium {
  width: 3rem !important;
  height: 3rem !important;
}

.spinner-small {
  width: 1rem !important;
  height: 1rem !important;
  border-width: 0.2em !important;
}

.spinner-primary {
  color: $primary;
}
</style>
