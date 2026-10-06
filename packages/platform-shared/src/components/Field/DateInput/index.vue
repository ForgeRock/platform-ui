<!-- Copyright (c) 2021-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="position-relative">
    <FrInputLayout
      :id="internalId"
      :name="name"
      :description="description"
      :errors="combinedErrors"
      :is-html="isHtml"
      :floating-label="floatingLabel"
      :label="label">
      <template #default="{ helpTextId }">
        <input
          v-model="inputValue"
          v-on="validationListeners"
          ref="input"
          type="date"
          :class="[{'is-invalid': errorMessages && errorMessages.length, 'py-0': !floatingLabel, 'polyfill-placeholder': label && floatingLabel }, 'form-control fr-hide-native-picker']"
          :data-vv-as="label"
          :disabled="disabled"
          :id="internalId"
          :name="name"
          :readonly="readonly"
          :aria-describedby="describedByIds(helpTextId)"
          :aria-invalid="isAriaInvalid"
          :aria-required="isRequiredAria">
        <BFormDatepicker
          v-model="inputValue"
          v-calendar-grid
          :dropleft="dropleft"
          button-only
          label-help=""
          ref="datePicker"
          :class="[{'is-invalid': errorMessages && errorMessages.length }, 'form-control date-button position-absolute']"
          :disabled="disabled"
          :id="internalId"
          :name="name"
          :min="minDate"
          :aria-label="labelTranslation"
          @shown="onShown"
          @hidden="deactivateFocusTrap">
          <template #button-content>
            <span class="sr-only">
              {{ `${fieldLabel || labelTranslation} ${$t('common.dateTimePicker.openCalendar')}` }}
            </span>
            <FrIcon
              name="calendar_today"
            />
          </template>
        </BFormDatepicker>
      </template>
    </FrInputLayout>
  </div>
</template>

<script>
import { isEqual, cloneDeep } from 'lodash';
import {
  BFormDatepicker,
} from 'bootstrap-vue';
import calendarGrid from '@forgerock/platform-shared/src/directives/calendarGrid';
import DatepickerFocusTrapMixin from '@forgerock/platform-shared/src/mixins/DatepickerFocusTrapMixin';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import { createAriaDescribedByList } from '@forgerock/platform-shared/src/utils/accessibilityUtils';
import { useField } from 'vee-validate';
import { v4 as uuid } from 'uuid';
import { toRef } from 'vue';
import FrInputLayout from '../Wrapper/InputLayout';
import FrIcon from '../../Icon';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Input for date (YYYY-MM-DD) with a floating label in the center, this will move when a user types into the input.
 */
export default {
  name: 'DateInput',
  directives: {
    'calendar-grid': calendarGrid,
  },
  mixins: [
    InputMixin,
    TranslationMixin,
    DatepickerFocusTrapMixin,
  ],
  components: {
    BFormDatepicker,
    FrIcon,
    FrInputLayout,
  },
  props: {
    dropleft: {
      default: true,
      type: Boolean,
    },
    fieldLabel: {
      default: '',
      type: String,
    },
    minDate: {
      default: '',
      type: String,
    },
    /**
     * Accessible name for the date picker dialog. Falls back to the generic
     * "Select date" when not provided — useful for distinguishing multiple
     * date pickers on one form (e.g. "Select date for Access End Date").
     */
    dialogLabel: {
      default: '',
      type: String,
    },
  },
  setup(props) {
    const {
      value: inputValue, errors: fieldErrors, meta, handleBlur,
    } = useField(() => `${props.name}-id-${uuid()}`, toRef(props, 'validation'), { validateOnMount: props.validationImmediate, initialValue: '', bails: false });

    // validationListeners: Contains custom event listeners for validation.
    // Since vee-validate +4 removes the interaction modes, this custom listener is added
    // to validate on blur to perform a similar aggressive validation in addition to the validateOnValueUpdate.
    const validationListeners = {
      blur: (evt) => handleBlur(evt, true),
    };

    return {
      inputValue, fieldErrors, meta, validationListeners,
    };
  },
  methods: {
    onShown() {
      this.fixDatePickerDialogLabel();
      this.activateFocusTrap();
    },
    fixDatePickerDialogLabel() {
      this.$nextTick(() => {
        const dialog = this.$el.querySelector('.date-button ~ .dropdown-menu, .date-button .dropdown-menu');
        if (dialog) {
          dialog.removeAttribute('aria-labelledby');
          dialog.setAttribute('aria-label', this.datePickerDialogLabel);
        }
      });
    },
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
    /**
     * Returns the ids of the elements describing this field for the input's `aria-describedby` attribute:
     * the ids of the validation errors, when present, followed by the id of the help text, when a description exists.
     * When there are no errors it falls back to the help text id (preferred, as the rendered description should win),
     * then the `describedbyId` prop, or undefined if neither is set.
     *
     * @param {String} helpTextId - id of the description rendered by InputLayout, passed through the default slot scope
     */
    describedByIds(helpTextId) {
      const describedBy = [this.describedbyId, helpTextId].filter(Boolean).join(' ') || undefined;
      if (!this.combinedErrors.length) {
        return describedBy;
      }

      const errorIds = createAriaDescribedByList(this.name, this.combinedErrors);
      return [errorIds, describedBy].filter(Boolean).join(' ') || undefined;
    },
  },
  computed: {
    /**
     * Determines the `aria-invalid` attribute's state based on field interactions and validation status,
     * following the same logic as BasicInput and TextArea.
     *
     * @returns {string|boolean} 'true' or 'false' as strings if the conditions dictate the field is invalid or valid respectively,
     * or false as a boolean if the field is neither touched nor requires immediate validation.
     */
    isAriaInvalid() {
      if (!this.meta.touched && !this.validationImmediate) {
        return false;
      }
      const ariaInvalid = this.ariaInvalid || !!this.combinedErrors.length;
      return ariaInvalid.toString();
    },
    combinedErrors() {
      return this.errors.concat(this.fieldErrors);
    },
    datePickerDialogLabel() {
      return this.dialogLabel || this.$t('common.dateTimePicker.selectDate');
    },
    labelTranslation() {
      return this.getTranslation(this.label);
    },
  },
  mounted() {
    // The dialog div is rendered at mount (hidden via CSS until opened), so label it now.
    // bootstrap-vue focuses the menu *before* emitting `shown`, so fixing only on @shown
    // would let focus land on an unnamed dialog on first open.
    this.fixDatePickerDialogLabel();
  },
  watch: {
    inputValue(newVal) {
      this.emitDateValue(newVal);
    },
  },
};
</script>

<style lang="scss" scoped>
  .date-button {
    width: 46.5px;
    border: none;
    right: 1px;
    bottom: 1px;

    :deep(button) {
      background-color: initial;
      color: $gray-500;
      padding: 0.85rem 0.5rem;
    }
  }
  .form-label-group.fr-field-error {
    .date-button {
      :deep(button) {
        border-width: 0 !important;
        border-radius: 0.25rem !important;
      }
    }
  }

  :deep(.date-button.show > .btn-secondary.dropdown-toggle) {
    background-color: initial;
    color: $gray-500;
  }

  :deep(button .material-icons-outlined) {
    font-size: 1em;
    line-height: 1;
  }

  .form-control.is-invalid {
    background-image: none;
  }

  // Hide the native calendar icon: BFormDatepicker's overlaid button already
  // occupies that corner, so the native indicator would duplicate it.
  // .fr-hide-native-picker (on the input) keeps the rule off the datepicker overlay.
  .fr-hide-native-picker {
    &::-webkit-calendar-picker-indicator {
      visibility: hidden;
    }
  }
</style>
