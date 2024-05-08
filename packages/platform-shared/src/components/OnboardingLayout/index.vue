<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="signup-step-layout d-flex">
    <div
      no-gutters
      class="d-none d-md-flex signup-demonstration-component justify-content-center align-items-center p-5 background-image">
      <h1 class="text-center display-3 text-white">
        {{ heroText }}
      </h1>
    </div>
    <div
      no-gutters
      class="signup-step-form d-md-flex align-items-start flex-column w-100">
      <div class="signup-header-wrapper px-4 px-md-5 w-100">
        <BImg
          class="mt-4"
          :src="require('@forgerock/platform-shared/src/assets/images/ping-logo-square-color.svg')"
          width="131"
          :alt="$t('common.pingIdentity')" />
      </div>
      <div class="signup-form-wrapper px-4 px-md-5 d-md-flex align-items-center w-100">
        <!-- @slot Main content -->
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import { BImg } from 'bootstrap-vue';

/**
 * Used to handle the layout for pages used in onboarding/registration for cloud tenants.
 * Has two sections. Left contains large hero text and right contains main app content.
 */
export default {
  name: 'Onboarding',
  components: {
    BImg,
  },
  props: {
    /**
     * Text that displays in left panel.
     */
    heroText: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.signup-header-wrapper {
  height: 5.25rem;
}

.signup-step-layout {
  min-height: 100vh;
  background-size: cover;
  background-position-y: bottom;
}

.background-image {
  background-image: url('~@forgerock/platform-shared/src/assets/images/bg-clouds.png');
}

.signup-demonstration-component {
  position: relative;
  overflow: hidden;
  width: 50%;
  transition: background-color 0.2s ease-in-out;
  background-size: cover;
  background-position-y: bottom;
}

@include media-breakpoint-up(md) {
  .signup-step-form {
    width: 50% !important;
    overflow: auto;
  }
}

.signup-form-wrapper {
  height: calc(100% - 5.25rem);

  > div {
    max-width: 600px;
  }
}
</style>
