<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BFormSpinbutton
    v-model="inputValue"
    v-on="$listeners"
    inline
    :name="name"
    :min="min"
    :max="max" />
</template>

<script>
import { BFormSpinbutton } from 'bootstrap-vue';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Spinbutton - number with +/- buttons around it, lightly wrapped bootstrap vue component
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @param {Number} min Lowest available number
 *  @param {Number} max Highest available number
 */
export default {
  name: 'SpinButton',
  mixins: [
    InputMixin,
  ],
  components: {
    BFormSpinbutton,
  },
  props: {
    /**
     * Minimum value allowed
     */
    min: {
      type: Number,
      default: 0,
    },
    /**
     * Maximum value allowed
     */
    max: {
      type: Number,
      default: 100,
    },
  },
  data() {
    return {
      inputValue: '',
    };
  },
};
</script>
