<!-- Copyright (c) 2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    :class="['d-flex', buttonPositionClass]"
  >
    <BButton
      :type="type"
      :variant="variant"
      :disabled="disabled"
      @click="$emit('click')">
      <slot />
    </BButton>
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue';

/**
 * Button with alignment, allows change position of button between full-width to left,
 * right and center. By default button takes full width based on component width.
 * If you are using this component inside a form with a submit listener use type=submit
 * property instead v-on:click for emit the submit event or use v-on:click with type=button
 * property otherwise this can create a double event emition.
 */
export default {
  name: 'ButtonWithAlignment',
  components: { BButton },
  props: {
    /**
     * Button Position button-full-width|button-left|button-center|button-right
     * button-full-width by default
     */
    buttonPosition: {
      type: String,
      default: 'button-full-width',
    },
    /**
     * Disable button
     * false by default
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Button type button|submit|reset
     * button by default
     */
    type: {
      type: String,
      default: 'button',
    },
    /**
     * Bootstrap variant
     * primary by default
     */
    variant: {
      type: String,
      default: 'primary',
    },
  },
  computed: {
    /**
     * return the class for position (center|full-width|left|right) the button inside the display flex div
     */
    buttonPositionClass() {
      return {
        'button-center': 'justify-content-center',
        'button-full-width': 'flex-column',
        'button-left': 'justify-content-start',
        'button-right': 'justify-content-end',
      }[this.buttonPosition]; // return the value of property with the buttonPosition key
    },
  },
};
</script>
