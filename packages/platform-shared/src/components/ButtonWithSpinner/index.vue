<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BButton
    :aria-label="buttonText || $t('common.save')"
    :disabled="disabled"
    :variant="variant"
    @click="$emit('click')"
    :data-testid="testid">
    <div v-if="!showSpinner">
      <FrIcon
        v-if="icon"
        :name="icon"
        :icon-class="iconClass" />
      {{ buttonText || $t('common.save') }}
    </div>
    <div
      v-else
      class="d-flex">
      <FrSpinner
        size="sm"
        class="spinner-border-sm mr-2"
        button-spinner />
      <span class="ml-1">
        {{ spinnerText || $t('common.saving') }}
      </span>
    </div>
  </BButton>
</template>

<script>
import { BButton } from 'bootstrap-vue';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

/**
 *  Button with a spinner and adjusted text while processing
 */
export default {
  name: 'ButtonWithSpinner',
  components: { BButton, FrSpinner, FrIcon },
  props: {
    /**
     * Text displayed in button
     */
    buttonText: {
      type: String,
      default: '',
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
     */
    spinnerText: {
      type: String,
      default: '',
    },
    /**
     * Bootstrap variant
     */
    variant: {
      type: String,
      default: 'primary',
    },
    testid: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: null,
    },
    iconClass: {
      type: String,
      default: null,
    },
  },
};
</script>
