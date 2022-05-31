<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrInputLayout
    class="flex-grow-1"
    :id="id"
    :name="name"
    :description="description"
    :errors="errors"
    :is-html="isHtml"
    :label="label"
    :validation="validation"
    :validation-immediate="validationImmediate">
    <input
      v-model.number="durationValue"
      ref="input"
      type="number"
      :class="[{'is-invalid': errorMessages && errorMessages.length, 'polyfill-placeholder': durationValue !== null && durationValue !== '' }, 'form-control']"
      :data-vv-as="label"
      :disabled="disabled"
      :id="id"
      :min="0"
      :name="name"
      :readonly="readonly"
      @input="emitDurationValue($event.data, durationUnit)">
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
  </FrInputLayout>
</template>

<script>
import {
  BDropdown,
  BDropdownItem,
  BInputGroupAppend,
} from 'bootstrap-vue';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrInputLayout from '../Wrapper/InputLayout';
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
    FrInputLayout,
  },
  data() {
    return {
      durationValue: null,
      durationUnit: null,
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
     * emits the fully formatted duration value
     *
     * @param {String|Number} durationValue Numerical input of the duration
     * @param {String} durationUnit Selectable unit input e.g. days, months, seconds
     * @emits {String} fully formatted duration value
     */
    emitDurationValue(durationValue, durationUnit) {
      if (durationValue !== null && durationValue !== '') {
        if (durationValue < 0 || durationValue === 'e' || durationValue === 'E') {
          this.durationValue = 0;
          this.$emit('input', 0);
        } else {
          this.$emit('input', this.buildFormattedDuration(durationValue, durationUnit));
        }
      } else {
        this.$emit('input', '');
      }
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
        // eslint-disable-next-line prefer-destructuring
        this.durationValue = match[2];
        if (match[3] === 'M' && newVal[1] === 'T') {
          this.durationUnit = 'minutes';
        } else {
          this.durationUnit = durationMap[match[3]];
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .form-control.is-invalid {
    background-image: none;
  }

  ::v-deep .form-label-group {
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
  }
</style>
