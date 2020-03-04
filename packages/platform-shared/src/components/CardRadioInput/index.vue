<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div>
    <label class="h-100 w-100 mb-0">
      <!--
        v-model event. Passed through from input.
        @event change
      -->
      <input
        type="radio"
        :checked="isChecked"
        :disabled="disabled"
        :name="name"
        :value="value"
        class="card-input-element"
        @change="$emit('change', value)">
      <BCard :class="['card-input', 'fr-card-clickable', cardBodyClass]">
        <!-- @slot Provide custom content for card body -->
        <slot>
          {{ value }}
        </slot>
      </BCard>
    </label>
  </div>
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
    prop: 'selected',
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
      default: '',
    },
    /**
     * if initial value is equal to the value prop, will initialize as the selected input.
     */
    selected: {
      type: [Number, String],
      default: '',
    },
    /**
     * Value that selecting the input will provide
     */
    value: {
      type: [Number, String],
      default: '',
    },
  },
  computed: {
    isChecked() {
      return this.value === this.selected;
    },
  },
};
</script>

<style lang="scss" scoped>
/* stylelint-disable */
.card-input-element {
  display: none;
}

.card.card-input {
  -webkit-box-shadow: none;
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
    right: -8px;
    top: -9px;
    color: $primary;
    background-color: $primary;
    height: 19px;
    width: 19px;
    border-radius: 10px;
    display: none;
  }

  &::after {
    content: 'check';
    position: absolute;
    font-family: 'Material Icons Outlined';
    right: -7px;
    top: -8px;
    text-align: right;
    width: 100%;
    height: 20px;
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
/* stylelint-enable */
</style>
