<!-- Copyright (c) 2021-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="position-relative">
    <FrInputLayout
      :id="id"
      :name="name"
      :description="description"
      :errors="errors"
      :is-html="isHtml"
      :label="label"
      :validation="validation"
      :validation-immediate="validationImmediate">
      <input
        v-model="inputValue"
        ref="input"
        type="time"
        :class="[{'is-invalid': errorMessages && errorMessages.length, 'polyfill-placeholder': label }, 'form-control']"
        :data-vv-as="label"
        :disabled="disabled"
        :id="id"
        :name="name"
        :readonly="readonly"
        @input="emitValidTime">
    </FrInputLayout>
    <BFormTimepicker
      v-model="inputValue"
      :dropleft="dropleft"
      button-only
      label-help=""
      no-close-button
      ref="timePicker"
      show-seconds
      :class="[{'is-invalid': errorMessages && errorMessages.length }, 'form-control time-button position-absolute']"
      :disabled="disabled"
      :id="id"
      :name="name"
      :aria-label="getTranslation(label)"
      @context="emitValidTime" />
  </div>
</template>

<script>
import { has, isEqual, cloneDeep } from 'lodash';
import { BFormTimepicker } from 'bootstrap-vue';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Input for time (HH:mm:ss.mmmZ) with a floating label in the center, this will move when a user types into the input.
 */
export default {
  name: 'TimeInput',
  mixins: [
    InputMixin,
    TranslationMixin,
  ],
  components: {
    BFormTimepicker,
    FrInputLayout,
  },
  props: {
    dropleft: {
      default: true,
      type: Boolean,
    },
  },
  methods: {
    /**
     * Emits out a formatted time in the form of HH:mm:ss or an empty string if time is invalid
     *
     * @param {String} selectedTime - The current time value selected
     * @emits {String} The fully formatted time string
     */
    emitValidTime(selectedTime) {
      const emitTime = has(selectedTime, 'value') ? selectedTime.value : selectedTime;
      if (emitTime) {
        this.$emit('input', `${`${emitTime}:00`.substring(0, 8)}.000`);
      } else {
        this.$emit('input', '');
      }
    },
    /**
     * Sets the time value for both the time picket and the time input
     */
    inputValueHandler(inputValue) {
      this.inputValue = inputValue.substring(0, 8);
    },
    /**
    * formats input value to be in the format that date picker and input expect
    *
    * @param {Number|String} newVal value to be set for input vale
    */
    setInputValue(newVal) {
      if (newVal !== undefined && newVal !== null && !isEqual(this.oldValue, newVal)) {
        this.inputValue = newVal.substring(0, 8);
        this.oldValue = cloneDeep(newVal);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .time-button {
    width: 46.5px;
    border: none;
    right: 1px;
    top: 1px;
    height: calc(100% - 2px);

    /deep/ button {
      background-color: initial;
      color: $gray-500;
      padding: 0.85rem 0.5rem;
    }

    /deep/ &.show > .btn-secondary.dropdown-toggle {
      background-color: initial;
      color: $gray-500;
    }
  }

  .form-control.is-invalid {
    background-image: none;
  }
</style>
