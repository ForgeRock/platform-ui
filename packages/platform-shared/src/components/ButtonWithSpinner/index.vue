<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BButton
    :disabled="disabled"
    :variant="variant"
    @click="$emit('click')">
    <div v-if="!showSpinner">
      {{ buttonText }}
    </div>
    <div
      v-else
      class="d-flex">
      <FrSpinner
        size="sm"
        class="spinner-border-sm mr-2"
        button-spinner />
      <span class="ml-1">
        {{ spinnerText ? spinnerText : buttonText }}
      </span>
    </div>
  </BButton>
</template>

<script>
import { BButton } from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';

/**
 *  Button with a spinner and adjusted text while processing
 */
export default {
  name: 'ButtonWithSpinner',
  components: { BButton, FrSpinner },
  props: {
    /**
     * Text displayed in button
     */
    buttonText: {
      type: String,
      default() {
        return this.$t('common.save');
      },
    },
    /**
     * Disable button
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Show spinner and alternate spinnerText if provided
     */
    showSpinner: {
      type: Boolean,
      default: false,
    },
    /**
     * Text to show when spinner is present
     * buttonText will show if no spinnerText
     */
    spinnerText: {
      type: String,
      default: null,
    },
    /**
     * Bootstrap variant
     */
    variant: {
      type: String,
      default: 'primary',
    },
  },
};
</script>
