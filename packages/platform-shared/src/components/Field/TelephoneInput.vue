<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="position-relative">
    <FrInputLayout
      :errors="combinedErrors"
      :id="internalId"
      :description="description"
      :floating-label="floatingLabel"
      :label="label"
      :name="name"
      :readonly-label="inputDisabled">
      <template #default="{ labelId }">
        <!-- `intl-tel-input` natively manages the DOM input value, hence skipping v-model binding -->
        <input
          class="form-control"
          :aria-labelledby="labelId"
          :id="internalId"
          v-on="listeners"
          v-bind="inputAttrs"
          :autocomplete="attrs.autocomplete"
          :data-testid="`input-${attrs.testid || name}`"
          :disabled="props.disabled"
          :readonly="props.readonly"
          :name="name"
          ref="telephoneInput"
          type="tel"
          :required="isRequiredField"
          :placeholder="attrs.placeholder ?? ' '"
          :aria-required="isRequiredField"
          :aria-describedby="ariaDescribedBy"
          :aria-invalid="isAriaInvalid">
      </template>
    </FrInputLayout>
  </div>
</template>

<script setup>
import {
  computed,
  defineOptions,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  ref,
  useAttrs,
  watch,
} from 'vue';
import 'intl-tel-input/build/css/intlTelInput.css';
import intlTelInput from 'intl-tel-input/build/js/intlTelInputWithUtils';
import { useField } from 'vee-validate';
import { v4 as uuid } from 'uuid';
import { debounce, uniq } from 'lodash';
import FrInputLayout from './Wrapper/InputLayout';
import i18n from '@/i18n';
import { createAriaDescribedByList } from '../../utils/accessibilityUtils';

defineOptions({ inheritAttrs: false });

const attrs = useAttrs();
const props = defineProps({
  ariaInvalid: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    default: '',
  },
  describedbyId: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Array,
    default: () => [],
  },
  id: {
    type: String,
    default: '',
  },
  isRequiredAria: {
    type: Boolean,
    default: false,
  },
  floatingLabel: {
    type: Boolean,
    default: true,
  },
  label: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  value: {
    type: String,
    default: '',
  },
  validation: {
    type: [Object, String],
    default: null,
  },
  validationImmediate: {
    type: Boolean,
    default: false,
  },
});

// List of events emitted by this component
const emit = defineEmits([
  'input',
]);

const inputAttrs = computed(() => {
  const filteredAttrs = { ...attrs };
  ['autocomplete', 'data-testid', 'inner-component', 'original-type', 'testid', 'type'].forEach((key) => delete filteredAttrs[key]);
  return filteredAttrs;
});
const labelLeftPosition = ref('75px');
const internalId = computed(() => props.id || `floatingLabelInput${getCurrentInstance().uid}`);
const inputDisabled = computed(() => props.disabled || props.readonly);

/**
 * Computes if the field is a mandatory field when either
 * - the `isRequiredAria` prop is true,
 * - the `validation` prop is an object with a `required` property set to true,
 * - or the `validation` prop is a string that includes 'required'.
 */
const isRequiredField = computed(() => props.isRequiredAria
  || (props.validation && typeof props.validation === 'object' && props.validation?.required)
  || (typeof props.validation === 'string' && props.validation.includes('required')));
let telephoneInputInstance;
const telephoneInput = ref(null);
// Identifies the telephone field for vee-validate
function telephoneFieldIdentifier() {
  return `${props.name}-id-${uuid()}`;
}

/**
 * Returns the error message corresponding to the given error code.
 * @param errorCode - The error code returned by the intl-tel-input validation.
 * @returns The corresponding error message.
 */
function getErrorMessage(errorCode) {
  const errorMap = {
    1: 'invalidCountryCode', // INVALID_COUNTRY_CODE
    2: 'tooShort', // TOO_SHORT
    3: 'tooLong', // TOO_LONG
    4: 'invalid', // INVALID_NUMBER
    5: 'invalid', // INVALID_LENGTH (direction unknown)
  };

  const errorKey = errorMap[errorCode] || 'invalid';
  return i18n.global.t(`common.validation.telephone.${errorKey}`);
}

/**
 * Validates the current telephone number and returns its validity and error message, if any.
 * @param {string} currentValue - The current value of the telephone input to validate.
 * @return {{isValid: boolean, errorMessage: string}} Validation result and error message.
 */
function telephoneValidator(currentValue) {
  if (!isRequiredField.value && !currentValue) {
    // Optional field with no value is considered valid
    return {
      isValid: true,
      errorMessage: '',
    };
  }

  if (isRequiredField.value && !currentValue) {
    // Required field with no value
    return {
      isValid: false,
      errorMessage: i18n.global.t('common.policyValidationMessages.REQUIRED'),
    };
  }

  // `isValidNumber` (possible-length check) is used instead of `isValidNumberPrecise`
  // (per-country pattern check) to avoid rejecting genuinely valid numbers when the
  // build-time numbering-plan metadata goes stale; pattern precision is left to the
  // backend's `valid-phone-format` policy.
  if (!telephoneInputInstance?.isValidNumber()) {
    const errorCode = telephoneInputInstance?.getValidationError();
    const errorMessage = getErrorMessage(errorCode);
    return {
      isValid: false,
      errorMessage,
    };
  }

  // Reject entries whose canonicalized digit count differs from what's displayed, since
  // canonicalization can silently drop a digit (e.g. a trailing overflow digit for `112345678900`,
  // or a leading trunk-prefix zero for `+3800021313131`) regardless of which end it's dropped from.
  const dialCode = telephoneInputInstance.getSelectedCountryData()?.dialCode || '';
  const canonicalNationalDigitCount = telephoneInputInstance.getNumber().replace(/\D/g, '').length - dialCode.length;
  const displayedNationalDigitCount = currentValue.replace(/\D/g, '').length;
  if (canonicalNationalDigitCount !== displayedNationalDigitCount) {
    // ERROR_CODE 4 = INVALID_NUMBER
    return {
      isValid: false,
      errorMessage: getErrorMessage(4),
    };
  }

  // Return true to indicate that validation passed
  return {
    isValid: true,
    errorMessage: '',
  };
}

// Form Field initialization option
const formFieldOptions = {
  validateOnMount: props.validationImmediate,
  bails: false,
};

/**
 * vee-validate rule that re-validates the number currently displayed in the input, so a parent
 * form's `validate()` call (e.g. on submit) sees the same validity as the field's inline errors.
 * @returns {true|string} `true` when valid, or an error message string when invalid.
 */
function telephoneVeeValidateRule() {
  const { isValid, errorMessage } = telephoneValidator(telephoneInput.value?.value ?? '');
  return isValid ? true : errorMessage;
}

const {
  errors: fieldErrors,
  setErrors,
  setTouched,
  setValue,
  meta,
} = useField(
  telephoneFieldIdentifier(),
  telephoneVeeValidateRule,
  formFieldOptions,
);

const combinedErrors = computed(() => uniq([...props.errors, ...fieldErrors.value]));

const ariaDescribedBy = computed(() => {
  if ((meta.valid && !props.errors.length) || !fieldErrors.value) return props.describedbyId || undefined;

  if (!combinedErrors.value) return props.describedbyId || undefined;

  return createAriaDescribedByList(props.name, combinedErrors.value);
});

const isAriaInvalid = computed(() => {
  if (!meta.touched && !props.validationImmediate) {
    return false;
  }
  const ariaInvalid = props.ariaInvalid || !!combinedErrors.value.length;
  return ariaInvalid.toString();
});

/**
 * Patches the country dropdown rendered by intl-tel-input to include an aria-label for accessibility.
 */
function patchCountryDropdown() {
  const countryDropdown = telephoneInput.value?.parentElement?.querySelector('.iti__country-container .iti__dropdown-content[role="dialog"]');
  if (countryDropdown) {
    countryDropdown.setAttribute('aria-label', i18n.global.t('common.telephoneInput.selectCountry'));
  }
}

/**
 * Sets the position of the floating label based on whether the input is focused or not, and offset using the width of the country dropdown.
 * It is done only when the floating label prop is true and there is no input value.
 * @param {boolean} focus - A boolean indicating whether the input is currently focused or not.
 */
function setLabelPosition(focus = false) {
  if (props.floatingLabel && !telephoneInput.value?.value) {
    const telephoneInputContainer = telephoneInput.value?.parentElement ?? document;
    if (focus) {
      const selectedCountryElement = telephoneInputContainer.querySelector('.iti__selected-country-primary');
      if (selectedCountryElement) {
        const countryDropdownWidth = selectedCountryElement.offsetWidth;
        labelLeftPosition.value = `${countryDropdownWidth}px`;
      }
    } else {
      const countryDropdownElement = telephoneInputContainer.querySelector('.iti__country-container');
      if (countryDropdownElement) {
        const countryDropdownWidth = countryDropdownElement.offsetWidth;
        labelLeftPosition.value = `${countryDropdownWidth - 4}px`;
      }
    }
  }
}

/**
 * Recalculates and sets the input's padding left offset from the country dropdown width.
 * This is to override the `intl-tel-input`'s paddingLeft calculation which goes wrong when:
 * - there is a slow import of its css,
 * - or when the input is behind an invisible container.
 */
function setInputPaddingLeft() {
  if (!telephoneInput.value) return;

  const telephoneInputContainer = telephoneInput.value?.parentElement;
  const selectedCountryElement = telephoneInputContainer?.querySelector('.iti__selected-country');

  if (selectedCountryElement) {
    const countryDropdownWidth = selectedCountryElement.offsetWidth;
    telephoneInput.value.style.paddingLeft = `calc(${countryDropdownWidth}px + 6px)`;
  }
}

/**
 * Initializes the intl-tel-input plugin on the telephone input field, with configuration for loading utils, and other settings.
 */
function createIntlTelInput() {
  if (!telephoneInput.value) return;

  telephoneInputInstance = intlTelInput(telephoneInput.value, {
    initialCountry: 'us',
    separateDialCode: true,
    strictMode: true,
    i18n: {
      selectedCountryAriaLabel: i18n.global.t('common.telephoneInput.selectedCountryAriaLabel'),
      noCountrySelected: i18n.global.t('common.telephoneInput.noCountrySelected'),
      countryListAriaLabel: i18n.global.t('common.telephoneInput.countryListAriaLabel'),
      searchPlaceholder: i18n.global.t('common.telephoneInput.searchPlaceholder'),
      clearSearchAriaLabel: i18n.global.t('common.telephoneInput.clearSearchAriaLabel'),
      searchEmptyState: i18n.global.t('common.telephoneInput.searchEmptyState'),
      searchSummaryAria: (count) => i18n.global.t('common.telephoneInput.searchSummaryAria', { count }),
    },
  });

  // Fix missing aria-label on country dropdown for accessibility, once
  // the intl-tel-input instance is initialized and the dropdown is rendered in the DOM
  telephoneInputInstance.promise.then(() => {
    patchCountryDropdown();
    setLabelPosition();
    setInputPaddingLeft();
  });

  if (inputDisabled.value) {
    telephoneInputInstance.setDisabled(true);
  }
}

/**
 * Sets a value on the intl-tel-input instance
 * @param {string} newValue - The new value to set on the intl-tel-input instance.
 */
function setInputValue(newValue) {
  if (telephoneInputInstance) {
    telephoneInputInstance.setNumber(newValue || '');
  }
}

/**
 * Emits the current input value to the parent component.
 */
function updateInputValue(emitInput = true) {
  const fullNumber = telephoneInputInstance?.getNumber() ?? '';
  setValue(fullNumber);
  if (emitInput) emit('input', fullNumber);
}

const wasInvalid = ref(false);
/**
 * Handles blur events on the telephone input field,
 * validating the current number and updating error messages accordingly.
 * @param {Event} event - The blur event object.
 * @param {boolean} skipLabelPosition - A boolean indicating whether to skip adjusting the label position (used when the blur event is triggered by a country change, to prevent unnecessary label position adjustments).
 */
function handleBlur(event, skipLabelPosition) {
  setTouched(true);
  setErrors([]);
  if (!skipLabelPosition) setLabelPosition(false);
  const { isValid, errorMessage } = telephoneValidator(event.target.value);
  wasInvalid.value = !isValid;
  if (isValid) {
    updateInputValue();
    return;
  }

  // You are here since validation has failed,
  if (errorMessage) {
    setErrors([errorMessage]);
  }
}

/**
 * Focus handler on telephone input to adjust the label position.
 */
function handleFocus() {
  setLabelPosition(true);
}

// Event listeners and their handlers for the telephone input field
const blurEventHandler = (event, skipLabelPosition) => handleBlur(event, skipLabelPosition);
const debouncedValidateOnInput = debounce((event) => {
  // validate on input only if the field was previously invalid
  if (wasInvalid.value) blurEventHandler(event, true);
}, 250);

const listeners = {
  input: debouncedValidateOnInput,
  blur: blurEventHandler,
  countrychange: (event) => blurEventHandler(event, true), // validate on country change to ensure the number is valid for the selected country
  focus: (event) => handleFocus(event),
};

onMounted(() => {
  createIntlTelInput();
  setInputValue(props.value); // initial value setup

  if (props.validationImmediate) {
    handleBlur({ target: { value: props.value } });
  }
});

watch(inputDisabled, (disabled) => {
  if (telephoneInputInstance) {
    telephoneInputInstance.setDisabled(disabled);
  }
});

onUnmounted(() => {
  debouncedValidateOnInput.cancel();
  if (telephoneInputInstance) {
    telephoneInputInstance.destroy();
  }
});

// Watch for any external changes to the value prop and update the input accordingly.
watch(() => props.value, (newValue) => {
  setInputValue(newValue);
  const fullNumber = telephoneInputInstance?.getNumber() ?? '';
  setValue(fullNumber);
});

</script>

<style lang="scss" scoped>
:deep() {
  .form-label-group.floating-label label {
    z-index: 2;
    left: v-bind(labelLeftPosition); // Adjusted to align the label to the right of the dial code
    max-width: stretch;
  }
  label.readonly-label {
    top: 1px !important;
    padding-bottom: calc(0.75rem - 2px) !important;
    background: transparent !important;
  }
  // When it is floating label and when the input is focused or has content, adjust the padding of the dial code to vertically center it with the input text.
  .form-label-group.floating-label {
    &:has(.iti .iti__tel-input:focus,
      .iti .iti__tel-input:not(:placeholder-shown)) {
      .iti .iti__country-container .iti__selected-country .iti__selected-dial-code {
        padding-top: $input-btn-padding-y + $input-btn-padding-y * calc(2 / 3);
        padding-bottom: calc($input-btn-padding-y / 3);
      }
    }
  }
  .iti {
    width: 100%;
    .iti__country-container {
      border-radius: 0.25rem 0 0 0.25rem;
      .iti__selected-country { // button that holds the selected country and dial code
        border: none !important; // to hide country code element's border appearing as extra
        border-radius: 0.25rem 0 0 0.25rem;
        left: 1px; // to avoid input's border being clipped by this button
        &:hover {
          background-color: var(--bg-white, #{$white}) !important;
          // only apply hover styles if the dial code is not being hovered,
          // as the dial code is within the selected country button
          .iti__selected-country-primary {
            background-color: transparent;
          }
          &:not(:has(.iti__selected-dial-code:hover)) {
            .iti__selected-country-primary {
              background-color: var(--btn-secondary-hover-bg-color, #{$gray-400});
            }
          }
        }
        // reset focus styles from button to the country dropdown for visual similarity
        &:focus-visible {
          outline: 0 !important;
          .iti__selected-country-primary {
            background-color: var(--btn-secondary-hover-bg-color, #{$input-focus-border-color});
            outline: 2px solid var(--input-focus-border-color, #{$input-focus-border-color});
            outline-offset: 3px;
            z-index: 1;
          }
        }
        .iti__selected-country-primary {
          padding: 0.75rem 1.25rem;
          border-right: 1px solid var(--input-border-color, #{$gray-400});
          pointer-events: none;
        }
        .iti__selected-dial-code {
          pointer-events: auto;
          padding-top: 0.75rem;
          padding-bottom: 0.75rem;
          padding-left: 0.75rem;
          margin-left: 0;
          &:hover {
            background: none;
          }
        }
        // reset default caret icons to material icon
        .iti__arrow {
          border: 0 !important; // remove default arrow styles
          width: 1rem;
          height: 1rem;
          position: relative;
          margin-left: 0;
          &::after {
            border: none;
            content: "expand_more";
            font-family: Material Icons Outlined;
            font-size: 1rem;
            line-height: 1;
            vertical-align: middle;
            position: absolute;
            top: 0;
            left: 0;
            margin-left: .255em;
            color: var(--input-color, #{$label-color});
          }
        }
      }
    }
    &.iti--allow-dropdown {
      .iti__country-container:not(:has(+ input[disabled])):not(:has(+ input[readonly])) .iti__selected-country-primary:hover {
        background-color: inherit;
      }
      .iti__country-container:has(+ input[disabled]) {
        button.iti__selected-country {
          background-color: var(--input-bg-disabled, #{$input-disabled-bg}) !important;
          pointer-events: none;
          .iti__selected-dial-code {
            pointer-events: none;
          }
        }
      }
    }
    .iti__tel-input {
      &:disabled {
        background-color: var(--input-bg-disabled, #{$input-disabled-bg}) !important;
        pointer-events: none;
      }
    }
  }
  .iti--inline-dropdown:not(.iti--container) .iti__dropdown-content {
    z-index: 10; // avoid overlapping with any near by elements
    background-color: var(--input-bg, #{$input-bg});
    border-color: var(--input-border-color, #{$input-border-color});
    color: var(--input-color, #{$label-color});
    font-size: 0.9375rem;
  }
  .iti__country-list {
    .iti__country{
      &.iti__highlight {
        background-color: var(--input-bg-active, #{$light-blue});
      }
      &[aria-selected="true"] {
        background-color: var(--input-bg-active, #{$light-blue}) !important;
        color: var(--input-color, #{$label-color}) !important;
      }
      .iti__country-name {
        flex-grow: 0;
      }
    }
  }

  .iti__search-input-wrapper {
    .iti__search-input {
      background-color: var(--input-bg, #{$input-bg});
      border-color: var(--input-border-color, #{$input-border-color});
      color: var(--input-color, #{$label-color});
      &:focus-visible {
        outline: none;
      }
    }
  }

  // Hide the check icon on selected country, to match with global styles of select dropdowns
  .iti__country-check {
    display: none;
  }
}
</style>
