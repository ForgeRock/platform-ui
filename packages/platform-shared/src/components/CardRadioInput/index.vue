<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <label class="h-100 w-100 mb-0 position-relative">
    <!--
      triggered on change and focus
      @event change
      @property {number|string|boolean} value - selected value
    -->
    <input
      type="radio"
      :checked="isChecked"
      :aria-checked="isChecked"
      :disabled="disabled"
      :name="name"
      :value="value"
      class="card-input-element"
      @change="$emit('change', radioValue)"
      @focus="$emit('change', radioValue)"
      :data-testid="testid">
    <BCard
      class="card-input fr-card-clickable"
      :body-class="cardBodyClass">
      <!-- @slot Provide custom content for card body -->
      <slot>
        <div :aria-label="radioValue">
          {{ radioValue }}
        </div>
      </slot>
    </BCard>
  </label>
</template>

<script>
import {
  BCard,
} from 'bootstrap-vue';

/**
 *  Turn cards into large radio buttons for use in wizards and step-by-step flows.
 */
export default {
  name: 'CardRadioInput',
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
     * Card radio inputs with the same name are grouped together. Only one input in group can be selected at a time.
     */
    name: {
      type: String,
      default: 'radio-input',
    },
    /**
     * if initial value is equal to the value prop, will initialize as the selected input.
     */
    value: {
      type: [Number, String, Boolean],
      default: '',
    },
    /**
     * Value that selecting the input will provide
     */
    radioValue: {
      type: [Number, String, Boolean],
      default: '',
    },
    testid: {
      type: String,
      default: '',
    },
  },
  computed: {
    isChecked() {
      return this.radioValue === this.value;
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
