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
        type="time"
        :class="[{'is-invalid': errorMessages && errorMessages.length, 'polyfill-placeholder': label }, 'form-control']"
        :data-vv-as="label"
        :disabled="disabled"
        :id="id"
        :name="name"
        :readonly="readonly"
        @input="debounceEmitValidTime(inputValue)">
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
      @context="debounceEmitValidTime" />
  </div>
</template>

<script>
import {
  cloneDeep,
  debounce,
  isEqual,
} from 'lodash';
import dayjs from 'dayjs';
import { BFormTimepicker } from 'bootstrap-vue';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

/**
 * Input for time (HH:mm:ss) with a floating label in the center, this will move when a user types into the input.
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
  data() {
    return {
      debounceEmitValidTime: debounce(this.emitValidTime, 100),
    };
  },
  methods: {
    /**
     * Emits out a formatted time in the form of HH:mm:ss.SSSZ or an empty string if time is invalid
     *
     * @param {String} selectedTime - The current time value selected
     * @emits {String} The fully formatted time string
     */
    emitValidTime(selectedTime) {
      let selectedHour = selectedTime.hours;
      let selectedMinute = selectedTime.minutes;
      let selectedSecond = selectedTime.seconds;
      if (typeof selectedTime === 'string') {
        if (selectedHour === undefined) {
          selectedHour = selectedTime.substring(0, 2);
        }
        if (selectedMinute === undefined) {
          selectedMinute = selectedTime.substring(3, 5);
        }
        if (selectedSecond === undefined) {
          selectedSecond = selectedTime.substring(6, 8);
        }
      }
      if ((selectedTime.hours !== null && selectedTime.minutes !== null) || typeof selectedTime === 'string') {
        const hours = selectedHour || 0;
        const minutes = selectedMinute || 0;
        const seconds = selectedSecond || 0;
        const emitTime = new Date();
        emitTime.setHours(hours, minutes, seconds);
        const emitTimeString = `${dayjs(emitTime).utc().format('HH:mm:ss')}Z`;
        this.$emit('input', emitTimeString);
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
        if (newVal.includes('Z')) {
          const localeTime = new Date();
          const timezoneOffset = localeTime.getTimezoneOffset();
          let timezoneHours;
          if (timezoneOffset >= 0) {
            timezoneHours = Math.floor(timezoneOffset / 60);
          } else {
            timezoneHours = Math.ceil(timezoneOffset / 60);
          }
          const timezoneMinutes = timezoneOffset - (timezoneHours * 60);
          localeTime.setHours(parseInt(newVal.substring(0, 2), 10) - timezoneHours, parseInt(newVal.substring(3, 5), 10) - timezoneMinutes, newVal.substring(6, 8));
          const hours = (`0${localeTime.getHours()}`).slice(-2);
          const minutes = (`0${localeTime.getMinutes()}`).slice(-2);
          const seconds = (`0${localeTime.getSeconds()}`).slice(-2);
          this.inputValue = `${hours}:${minutes}:${seconds}`;
        } else {
          this.inputValue = newVal.substring(0, 8);
        }
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
