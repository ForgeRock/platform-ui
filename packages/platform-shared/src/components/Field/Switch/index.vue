<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="d-flex flex-row-reverse">
    <label
      v-if="!srOnlyLabel"
      :class="[{'mt-2': size !== 'sm'}, 'mb-0 text-secondary w-100']">
      <span
        :id="`helppopover-${name}`"
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
      :aria-label="switchLabel"
      :name="name"
      :size="size"
      :disabled="disabled">
      <slot name="appendLabel">
        <span class="sr-only">
          {{ switchLabel }}
        </span>
      </slot>
    </BFormCheckbox>
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
     * Set label to be screen reader only
     */
    srOnlyLabel: {
      type: Boolean,
      default: false,
    },
    /**
     * Size of toggle switch
     */
    size: {
      type: String,
      default: 'lg',
    },
  },
  data() {
    return {
      inputValue: '',
    };
  },
  computed: {
    switchLabel() {
      return this.label || this.description;
    },
  },
};
</script>
