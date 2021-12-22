<!-- Copyright (c) 2021-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <label
      v-if="label && isHtml"
      v-html="label"
      :for="`${id}-date`"
      class="pe-none overflow-hidden text-nowrap" />
    <label
      v-else-if="label"
      :for="`${id}-date`"
      class="pe-none overflow-hidden text-nowrap">
      {{ getTranslation(label) }}
    </label>
    <BRow class="form-row">
      <BCol>
        <FrDateInput
          v-model="dateValue"
          ref="dateInput"
          :aria-label="getTranslation(label)"
          :class="{'is-invalid': errorMessages && errorMessages.length }"
          :dropleft="dropleft"
          :id="`${id}-date`"
          :description="description"
          :errors="errors"
          :is-html="isHtml"
          :name="name"
          :validation="validation"
          :validation-immediate="validationImmediate"
          @input="emitDateTimeValue" />
      </BCol>
      <BCol>
        <FrTimeInput
          v-model="timeValue"
          ref="timeInput"
          :aria-label="getTranslation(label)"
          :class="{'is-invalid': errorMessages && errorMessages.length }"
          :dropleft="dropleft"
          :disabled="disabled"
          :id="`${id}-time`"
          :name="name"
          :validation="validation"
          :validation-immediate="validationImmediate"
          @input="emitDateTimeValue" />
      </BCol>
    </BRow>
  </div>
</template>

<script>
import { BCol, BRow } from 'bootstrap-vue';
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
    dropleft: {
      default: true,
      type: Boolean,
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
        this.$emit('input', `${this.dateValue}T${this.timeValue}`);
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
      const regexp = /([\d-]{10})T([\d:+]{8}).*/g;
      const match = regexp.exec(newVal);
      if (match) {
        [, this.dateValue, this.timeValue] = match;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .form-control.is-invalid {
    background-image: none;
  }
</style>