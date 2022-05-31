<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

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
        type="date"
        :class="[{'is-invalid': errorMessages && errorMessages.length, 'polyfill-placeholder': label }, 'form-control']"
        :data-vv-as="label"
        :disabled="disabled"
        :id="id"
        :name="name"
        :readonly="readonly"
        @input="emitDateValue(inputValue)">
    </FrInputLayout>
    <BFormDatepicker
      v-model="inputValue"
      :dropleft="dropleft"
      button-only
      label-help=""
      ref="datePicker"
      :class="[{'is-invalid': errorMessages && errorMessages.length }, 'form-control date-button position-absolute']"
      :disabled="disabled"
      :id="id"
      :name="name"
      :aria-label="getTranslation(label)"
      @input="emitDateValue(inputValue)" />
  </div>
</template>

<script>
import { isEqual, cloneDeep } from 'lodash';
import {
  BFormDatepicker,
} from 'bootstrap-vue';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Input for date (YYYY-MM-DD) with a floating label in the center, this will move when a user types into the input.
 */
export default {
  name: 'DateInput',
  mixins: [
    InputMixin,
    TranslationMixin,
  ],
  components: {
    BFormDatepicker,
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
     * Constructs a formatted and validated date in the form of YYYY-MM-DD
     *
     * @param {String} dateValue Currently entered date value
     * @returns {String} The fully formatted date string
     */
    buildFormattedDate(dateValue) {
      try {
        const date = new Date(dateValue);
        date.toISOString();
        const day = (`0${date.getUTCDate()}`).slice(-2);
        const month = (`0${date.getUTCMonth() + 1}`).slice(-2);
        const year = (`000${date.getUTCFullYear()}`).slice(-4);
        return `${year}-${month}-${day}`;
      } catch (error) {
        return '';
      }
    },
    /**
     * Sets the date value for both the date picker and the date input
     *
     * @param {String} inputValue value to be set for input value
     */
    inputValueHandler(inputValue) {
      if (inputValue) {
        this.inputValue = this.buildFormattedDate(inputValue);
      }
    },
    /**
     * emits out formatted and validated date value.
     *
     * @param {String} newVal value to be emitted
     * @emits {String} input - The current date value entered
     */
    emitDateValue(newVal) {
      this.$emit('input', this.buildFormattedDate(newVal));
    },
    /**
    * formats input value to be in the format that date picker and input expect
    *
    * @param {Number|String} newVal value to be set for input value
    */
    setInputValue(newVal) {
      if (newVal !== undefined && newVal !== null && !isEqual(this.oldValue, newVal)) {
        this.inputValue = this.buildFormattedDate(newVal);
        this.oldValue = cloneDeep(newVal);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .date-button {
    width: 46.5px;
    border: none;
    right: 1px;
    top: 1px;
    height: calc(100% - 2px);

    ::v-deep button {
      background-color: initial;
      color: $gray-500;
      padding: 0.85rem 0.5rem;
    }

    ::v-deep &.show > .btn-secondary.dropdown-toggle {
      background-color: initial;
      color: $gray-500;
    }
  }

  .form-control.is-invalid {
    background-image: none;
  }
</style>
