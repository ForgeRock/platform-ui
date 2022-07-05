<!-- Copyright (c) 2021-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex">
    <BFormCheckbox
      v-model="inputValue"
      v-on="$listeners"
      class="mr-0 zindex-1"
      role="checkbox"
      inline
      :aria-label="switchLabel"
      :disabled="disabled"
      :name="name"
      :data-testid="testid"
      :value="$attrs.cbcheckedvalue"
      :unchecked-value="$attrs.cbuncheckedvalue" />
    <label class="mb-1 text-secondary">
      {{ switchLabel }}
    </label>
  </div>
</template>

<script>
import { BFormCheckbox } from 'bootstrap-vue';
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
    BFormCheckbox,
  },
  props: {
    testid: {
      type: String,
      default: '',
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
