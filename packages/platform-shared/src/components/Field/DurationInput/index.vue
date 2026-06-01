<!-- Copyright (c) 2021-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrBasicInput
    class="flex-grow-1"
    type="number"
    :autofocus="autofocus"
    :description="description"
    :disabled="disabled"
    :errors="errors"
    :floating-label="floatingLabel"
    :id="id"
    :is-html="isHtml"
    :label="label"
    :name="name"
    :placeholder="placeholder"
    :readonly="readonly"
    :validation="durationValidation"
    :validation-immediate="validationImmediate"
    ref="basicInput"
    :value="durationValue"
    @input="onNumberInput">
    <template #append>
      <BInputGroupAppend>
        <BDropdown
          variant="outline-secondary">
          <template #button-content>
            <span>{{ durationUnit }}</span>
          </template>
          <BDropdownItem
            v-for="unit in durationUnitOptions"
            :key="unit.value"
            @click="setDurationUnit(unit.value)">
            {{ unit.text }}
          </BDropdownItem>
        </BDropdown>
      </BInputGroupAppend>
    </template>
  </FrBasicInput>
</template>

<script>
import {
  BDropdown,
  BDropdownItem,
  BInputGroupAppend,
} from 'bootstrap-vue';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrBasicInput from '../BasicInput';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Input for duration in the format of (P[n]Y[n]M[n]DT[n]H[n]M[n]S or P[n]W).
 */
export default {
  name: 'DurationInput',
  mixins: [
    InputMixin,
    TranslationMixin,
  ],
  components: {
    BDropdown,
    BDropdownItem,
    BInputGroupAppend,
    FrBasicInput,
  },
  data() {
    return {
      durationUnit: null,
      durationValue: '',
      durationUnitOptions: [
        { text: this.$t('date.years'), value: 'years' },
        { text: this.$t('date.months'), value: 'months' },
        { text: this.$t('date.weeks'), value: 'weeks' },
        { text: this.$t('date.days'), value: 'days' },
        { text: this.$t('date.hours'), value: 'hours' },
        { text: this.$t('date.minutes'), value: 'minutes' },
        { text: this.$t('date.seconds'), value: 'seconds' },
      ],
    };
  },
  props: {
    defaultUnit: {
      default: 'days',
      type: String,
    },
  },
  mounted() {
    if (!this.durationUnit) {
      this.durationUnit = this.defaultUnit;
    }
  },
  computed: {
    durationValidation() {
      const base = { non_negative_integer: true };
      if (!this.validation) return base;
      if (typeof this.validation === 'string') {
        return { ...base, ...Object.fromEntries(this.validation.split('|').map((r) => [r, true])) };
      }
      return { ...base, ...this.validation };
    },
  },
  methods: {
    /**
     * Constructs a formatted duration in the form of P<durationValue><durationUnit>
     *
     * @param {String} durationValue Currently entered duration value
     * @param {String} durationUnit Selected time unit
     * @returns {String} The fully formatted duration string
     */
    buildFormattedDuration(durationValue, durationUnit) {
      const durationMap = {
        years: 'Y',
        months: 'M',
        weeks: 'W',
        days: 'D',
        hours: 'H',
        minutes: 'M',
        seconds: 'S',
      };
      let timeUnit = '';
      if (durationUnit === 'hours' || durationUnit === 'minutes' || durationUnit === 'seconds') {
        timeUnit = 'T';
      }
      return `P${timeUnit}${durationValue}${durationMap[durationUnit]}`;
    },
    /**
     * Emits the fully formatted ISO 8601 duration string, or an empty string when the value
     * has been cleared. Callers are responsible for ensuring durationValue is non-negative
     * before calling this method.
     *
     * @param {String|Number} durationValue Non-negative numerical portion of the duration
     * @param {String} durationUnit Selected time unit e.g. days, months, seconds
     * @emits {String} Fully formatted ISO 8601 duration string (e.g. "P5D") or empty string
     */
    emitDurationValue(durationValue, durationUnit) {
      if (durationValue !== null && durationValue !== '') {
        this.$emit('input', this.buildFormattedDuration(durationValue, durationUnit));
      } else {
        this.$emit('input', '');
      }
    },
    /**
     * Handles numeric input from FrBasicInput. FrBasicInput's removeNonNumericChars strips non-numeric characters before emitting,
     * So inputValue receives a number (e.g. 5 for '5abc'). When the stripped value equals the existing inputValue, Vue skips the DOM update
     * and the raw text stays visible. We force a DOM correction in that case by directly updating the underlying input element via $refs.
     * The value is always stored as a string to match setInputValue's regex output and keep the strict-equality early-return guard reliable.
     *
     * @param {Number|String} inputValue Stripped numeric value emitted by FrBasicInput
     */
    onNumberInput(inputValue) {
      const normalised = inputValue === null || inputValue === '' ? '' : String(inputValue);
      if (normalised === this.durationValue) {
        const inputEl = this.$refs.basicInput?.$refs?.input;
        if (inputEl) inputEl.value = normalised;
        return;
      }
      this.durationValue = normalised;
      this.emitDurationValue(normalised, this.durationUnit);
    },
    /**
     * sets the saved duration unit and sends off for emitting
     *
     * @param {String} selectedUnit Selected duration unit e.g. days, months, seconds
     */
    setDurationUnit(selectedUnit) {
      this.durationUnit = selectedUnit;
      this.emitDurationValue(this.durationValue, this.durationUnit);
    },
    /**
     * sets the input and select based on passed in v-model
     *
     * @param {String} newVal formatted duration value
     */
    setInputValue(newVal) {
      const durationMap = {
        Y: 'years',
        M: 'months',
        W: 'weeks',
        D: 'days',
        H: 'hours',
        S: 'seconds',
      };
      const regexp = /(P\D*)(\d+)(\D)(\D*)/g;
      const match = regexp.exec(newVal);
      if (match && match[2]) {
        const resolvedUnit = match[3] === 'M' && newVal[1] === 'T' ? 'minutes' : durationMap[match[3]];
        if (!resolvedUnit) return;
        // eslint-disable-next-line prefer-destructuring
        this.durationValue = match[2];
        this.durationUnit = resolvedUnit;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  :deep(.form-control.is-invalid) {
    background-image: none;
  }

  :deep(.form-label-group) {
    .form-label-group-input input {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &.fr-field-error button:not(.btn-sm) {
      border-left: 1px solid $red;
      border-top-right-radius: 0.25rem !important;
      border-bottom-right-radius: 0.25rem !important;
    }

    button {
      padding-top: 0.65rem;
      padding-bottom: 0.65rem;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }

    button:focus-visible {
      outline-offset: 0;
    }
  }

  :deep(.form-label-group-input:focus-within) {
    z-index: 3;
  }
</style>
