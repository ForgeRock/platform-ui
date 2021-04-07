<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-row-reverse">
    <label :class="[{'mt-2': size !== 'sm'}, 'mb-0 text-secondary w-100']">
      <span
        :id="`helppopover-${name}`"
        tabindex="0"
        class="fr-label-text">
        {{ switchLabel }}
      </span>
    </label>
    <BFormCheckbox
      v-model="inputValue"
      v-on="$listeners"
      class="d-inline-flex fr-toggle-primary"
      role="switch"
      switch
      :name="name"
      :size="size" />
  </div>
</template>

<script>
import { BFormCheckbox } from 'bootstrap-vue';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Toggle switch with a label to the right
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @param {Boolean} value default ''
 *  @param {string} size default 'lg'
 */
export default {
  name: 'FrSwitch',
  mixins: [
    InputMixin,
  ],
  components: {
    BFormCheckbox,
  },
  props: {
    /**
     * Size of toggle switch
     */
    size: {
      type: String,
      default: 'lg',
    },
  },
  computed: {
    switchLabel() {
      return this.label || this.description;
    },
  },
};
</script>
