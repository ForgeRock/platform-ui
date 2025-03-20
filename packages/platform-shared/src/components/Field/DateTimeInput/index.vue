<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="text-left">
    <label
      v-if="label && isHtml"
      v-html="label"
      :for="`${internalId}-date`"
      class="pe-none overflow-hidden text-nowrap d-block" />
    <label
      v-else-if="label"
      :for="`${internalId}-date`"
      class="pe-none overflow-hidden text-nowrap d-block">
      {{ labelTranslation }}
    </label>
    <BRow class="form-row">
      <BCol>
        <FrDateInput
          :value="dateValue"
          @input="dateValue = $event; emitDateTimeValue()"
          ref="dateInput"
          :aria-label="labelTranslation"
          :class="{'is-invalid': errorMessages && errorMessages.length }"
          :disabled="disabled"
          :dropleft="dropleft"
          :id="`${internalId}-date`"
          :description="description"
          :errors="errors"
          :is-html="isHtml"
          :name="`${name}-date`"
          :validation="validation"
          :minDate="minDate"
          :validation-immediate="validationImmediate" />
      </BCol>
      <BCol>
        <FrTimeInput
          :value="timeValue"
          @input="timeValue = $event; emitDateTimeValue()"
          ref="timeInput"
          :adjust-for-timezone="adjustForTimezone"
          :aria-label="labelTranslation"
          :class="{'is-invalid': errorMessages && errorMessages.length }"
          :dropleft="dropleft"
          :disabled="disabled"
          :id="`${internalId}-time`"
          :name="`${name}-time`"
          :show-seconds="showSeconds"
          :validation-immediate="validationImmediate"
          @utc-input="emitDateTimeValue" />
      </BCol>
    </BRow>
  </div>
</template>

<script>
import { BCol, BRow } from 'bootstrap-vue';
import dayjs from 'dayjs';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import InputMixin from '../Wrapper/InputMixin';
import FrDateInput from '../DateInput';
import FrTimeInput from '../TimeInput';

/**
 * Input for datetime (YYYY-MM-DDTHH.MM.SS.mmmZ) with a floating label in the center, this will move when a user types into the input.
 */
export default {
  name: 'DateTimeInput',
  mixins: [
    InputMixin,
    TranslationMixin,
  ],
  components: {
    BCol,
    BRow,
    FrDateInput,
    FrTimeInput,
  },
  props: {
    /**
     * If a timezone component is used, ensure we don't
     * adjust dates automatically for timezones
     */
    adjustForTimezone: {
      default: true,
      type: Boolean,
    },
    dropleft: {
      default: true,
      type: Boolean,
    },
    showSeconds: {
      default: true,
      type: Boolean,
    },
    minDate: {
      default: '',
      type: String,
    },
  },
  data() {
    return {
      dateValue: null,
      timeValue: null,
    };
  },
  methods: {
    /**
     * Ensures current datetime value is valid before emitting out.
     *
     * @emits {String} Formatted datetime value
     */
    emitDateTimeValue() {
      if (this.dateValue !== '' && this.dateValue !== null && this.timeValue !== '' && this.timeValue !== null) {
        if (this.adjustForTimezone) {
          const emitTime = new Date(this.dateValue);
          const timezoneOffset = emitTime.getTimezoneOffset();
          const hours = dayjs(`${this.dateValue}T${this.timeValue}`).utc().hour();
          const minutes = dayjs(`${this.dateValue}T${this.timeValue}`).utc().minute();
          const totalMinutes = (hours * 60) + minutes;

          if (timezoneOffset > totalMinutes) {
            emitTime.setDate(emitTime.getDate() + 1);
          } else if (timezoneOffset < 0 && (totalMinutes - timezoneOffset >= 1440)) {
            emitTime.setDate(emitTime.getDate() - 1);
          }
          this.$emit('input', `${dayjs(emitTime).utc().format('YYYY-MM-DD')}T${this.timeValue}`);
        } else {
          this.$emit('input', `${dayjs(this.dateValue).format('YYYY-MM-DD')}T${this.timeValue}`);
        }
      } else if (this.dateValue !== '' && this.dateValue !== null) {
        if (this.adjustForTimezone) {
          const emitTime = new Date(this.dateValue);
          emitTime.setHours(24, 0, 0, 0);
          this.$emit('input', `${dayjs(emitTime).utc().format('YYYY-MM-DDTHH:mm:ss')}Z`);
        } else {
          this.$emit('input', `${dayjs(this.dateValue).format('YYYY-MM-DDTHH:mm:ss')}`);
        }
      } else {
        this.$emit('input', '');
      }
    },
    /**
     * sets both date and time inputs based on passed in v-model
     *
     * @param {String} newVal formatted duration value
     */
    setInputValue(newVal) {
      const regexp = /([\d-]{10})T([\d:+]{5}.*)/g;
      const match = regexp.exec(newVal);
      if (match) {
        [, this.dateValue, this.timeValue] = match;
        if (this.timeValue.includes('Z')) {
          this.dateValue = dayjs(newVal).format('YYYY-MM-DD');
        }
      }
    },
  },
  computed: {
    labelTranslation() {
      return this.getTranslation(this.label);
    },
  },
};
</script>

<style lang="scss" scoped>
  .form-control.is-invalid {
    background-image: none;
  }
</style>
