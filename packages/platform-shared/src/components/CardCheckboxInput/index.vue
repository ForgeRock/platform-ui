<!-- Copyright (c) 2020-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <label class="w-100 mb-0 position-relative">
    <input
      type="checkbox"
      role="checkbox"
      :checked="value"
      :aria-checked="value"
      :disabled="disabled"
      :value="value"
      class="card-input-element"
      @change="$emit('change', $event.target.checked)"
      @focus="$emit('change', value)">
    <BCard
      class="card-input fr-card-clickable"
      :body-class="cardBodyClass">
      <!-- @slot Provide custom content for card body -->
      <slot />
    </BCard>
  </label>
</template>

<script>
import {
  BCard,
} from 'bootstrap-vue';

/**
 *  Turn cards into large checkbox buttons
 */
export default {
  name: 'CardCheckboxInput',
  model: {
    prop: 'value',
    event: 'change',
  },
  components: {
    BCard,
  },
  props: {
    /**
     * CSS class to apply to card body
     */
    cardBodyClass: {
      type: String,
      default: '',
    },
    /**
     * Disables the input
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Value that selecting the input will provide
     */
    value: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
.card-input-element {
  appearance: none;
  position: absolute;
  width: 100%;
  height: 100%;
}

.card.card-input {
  box-shadow: none;
  border: 1px solid $card-border-color;
}

.card-input:hover {
  cursor: pointer;
  border-color: $primary;
}

.card-input-element + .card-input {
  &::before {
    content: '';
    position: absolute;
    right: -9px;
    top: -9px;
    background-color: $primary;
    height: 19px;
    width: 19px;
    border-radius: 10px;
    display: none;
  }

  &::after {
    content: 'check';
    position: absolute;
    font-family: 'Material Icons Outlined', sans-serif;
    right: -7px;
    top: -9px;
    text-align: right;
    width: 100%;
    line-height: 19px;
    color: $white;
    display: none;
  }
}

.card-input-element:checked + .card-input {
  border-color: $primary;

  &::before,
  &::after {
    display: block;
  }
}

.card-input-element:disabled + .card-input {
  background-color: $gray-100;
  box-shadow: none;

  &:hover,
  &:active {
    cursor: auto;
    border-color: $card-border-color;
  }
}
</style>
