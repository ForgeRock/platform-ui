<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BFormSpinbutton
    v-model="inputValue"
    v-on="$listeners"
    inline
    :aria-label="switchLabel"
    :disabled="disabled"
    :name="name"
    :min="min"
    :max="max" />
</template>

<script>
import { BFormSpinbutton } from 'bootstrap-vue';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Checkbox with a label to the right
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @param {Boolean} value default ''
 */
export default {
  name: 'FrCheckbox',
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
  computed: {
    switchLabel() {
      return this.label || this.description;
    },
  },
};
</script>

<style lang="scss" scoped>
.zindex-1 {
  z-index: 1;
}
</style>
