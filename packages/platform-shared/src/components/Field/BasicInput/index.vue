<!-- Copyright (c) 2021-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrInputLayout
      :id="internalId"
      :name="name"
      :description="description"
      :errors="combinedErrors"
      :floating-label="floatingLabel"
      :is-html="isHtml"
      :label="label"
      :class="{ 'has-prepend-btn': hasPrependBtn }">
      <template #default="{ labelHeight }">
        <!--
          slot scoped variable labelHeight is used to change the height of the input as follows:
          - the label height is calculated as labelHeight + 2px (border of label)
          - padding top is calculated as labelHeight - 27px (size of label text with floating label)
        -->
        <input
          v-if="fieldType === 'number'"
          :value="inputValue"
          v-on="validationListeners"
          ref="input"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          :class="inputClasses"
          :data-vv-as="label"
          :disabled="disabled"
          :id="internalId"
          :name="name"
          :min="$attrs.min"
          :placeholder="floatingLabel ? false : placeholder"
          :readonly="readonly"
          :style="labelHeight && {height: `${labelHeight + 2}px`, 'padding-top': `${labelHeight - 27}px`}"
          @input="event => inputValue = removeNonNumericChars(event)"
          :aria-describedby="ariaDescribedBy"
          :aria-required="isRequiredAria"
          @animationstart="floatingLabel && animationStart"
          @blur="onBlur($event)"
          @focus="(floatingLabel && label) && (floatLabels = true)"
          :data-testid="`input-${testid}`">
        <input
          v-else
          v-model="inputValue"
          v-on="validationListeners"
          ref="input"
          :class="inputClasses"
          :data-vv-as="label"
          :disabled="disabled"
          :id="internalId"
          :name="name"
          :placeholder="floatingLabel ? false : placeholder"
          :readonly="readonly"
          :type="fieldType"
          :autocomplete="$attrs.autocomplete"
          :style="labelHeight && {height: `${labelHeight + 2}px`, 'padding-top': `${labelHeight - 27}px`}"
          :aria-describedby="ariaDescribedBy"
          :aria-required="isRequiredAria"
          @blur="onBlur($event);"
          @focus="(floatingLabel && label) && (floatLabels = true)"
          @animationstart="floatingLabel && animationStart"
          :data-testid="`input-${testid}`">
      </template>
      <template
        #defaultButtons
        v-if="type === 'password' || copy">
        <BInputGroupAppend
          class="within-input-button"
          v-if="type === 'password'">
          <BButton
            @click="revealText"
            :class="[{'disabled': disabled}]"
            name="revealButton"
            :aria-label="showPassword ? hideText : showText"
            @keyup.enter="$emit('enter')"
            :data-testid="`btn-show-password-${testid}`">
            <FrIcon :name="showPassword ? 'visibility_off' : 'visibility'" />
          </BButton>
        </BInputGroupAppend>
        <BInputGroupAppend v-if="copy">
          <button
            :id="`copyButton-${value}`"
            :data-testid="`btn-copy-${testid}`"
            class="btn btn-outline-secondary"
            name="copyButton"
            @click.prevent="copyValueToClipboard(value)">
            <FrIcon name="copy" />
          </button>
          <BTooltip
            :target="`copyButton-${value}`"
            placement="top"
            triggers="hover"
            :title="$t('common.copy')" />
        </BInputGroupAppend>
      </template>

      <template
        v-for="(key, slotName) in $slots"
        #[slotName]="slotData">
        <!-- @slot passthrough slot -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </FrInputLayout>
  </div>
</template>

<script>
import {
  BButton,
  BInputGroupAppend,
  BTooltip,
} from 'bootstrap-vue';
import { delay } from 'lodash';
import * as clipboard from 'clipboard-polyfill/text';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { createAriaDescribedByList } from '@forgerock/platform-shared/src/utils/accessibilityUtils';
import { useField } from 'vee-validate';
import { toRef } from 'vue';
import uuid from 'uuid/v4';
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Input with a floating label in the center, this will move when a user types into the input (example can be seen on default login page).
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @param {Number|String} value default ''
 */
export default {
  name: 'BasicInput',
  mixins: [
    NotificationMixin,
    TranslationMixin,
    InputMixin,
  ],
  components: {
    BButton,
    BInputGroupAppend,
    BTooltip,
    FrIcon,
    FrInputLayout,
  },
  props: {
    /**
     * Determines if copy button should be appended to field
     */
    copy: {
      type: Boolean,
      default: false,
    },
    /**
     * Input type password|text
     */
    type: {
      type: String,
      default: '',
    },
    testid: {
      type: String,
      default: '',
    },
    /**
     * Id of describeBy element
     */
    describedbyId: {
      type: String,
      default: '',
    },
    /**
     * Sets aria-required as the value provided
     */
    isRequiredAria: {
      type: Boolean,
      default: false,
    },
    /**
     * When true will show the value of a password as text instead of it being hidden
     */
    forceShowPassword: {
      type: Boolean,
      default: false,
    },
    /**
     * Custom input class
     */
    inputClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showPassword: false,
      hasAppendSlot: Object.keys(this.$slots).includes('append'),
      hasPrependBtn: Object.keys(this.$slots).includes('prependButton'),
    };
  },
  setup(props) {
    const {
      value: inputValue, errors: fieldErrors, meta: { valid }, handleBlur,
    } = useField(() => `${props.name}-id-${uuid()}`, toRef(props, 'validation'), { validateOnMount: props.validationImmediate, initialValue: '', bails: false });

    // validationListeners: Contains custom event listeners for validation.
    // Since vee-validate +4 removes the interaction modes, this custom listener is added
    // to validate on blur to perform a similar aggressive validation in addition to the validateOnValueUpdate.
    const validationListeners = {
      blur: (evt) => handleBlur(evt, true),
    };

    return {
      inputValue, fieldErrors, valid, validationListeners,
    };
  },
  mounted() {
    // Browser consistent focus
    if (this.autofocus) {
      delay(() => {
        if (this.$refs.input) {
          this.$refs.input.focus();
        }
      }, 600);
    }
  },
  computed: {
    showText() {
      return this.$t('common.showLabel', { label: this.getTranslation(this.label) });
    },
    hideText() {
      return this.$t('common.hideLabel', { label: this.getTranslation(this.label) });
    },
    fieldType() {
      if (this.type === 'number') {
        return 'number';
      }
      return this.type === 'password' && !this.showPassword && !this.forceShowPassword ? 'password' : 'text';
    },
    inputClasses() {
      const inputClasses = ['form-control', this.inputClass];
      if (this.floatLabels) {
        inputClasses.push('polyfill-placeholder');
      }
      if (this.errorMessages?.length) {
        inputClasses.push('is-invalid');
      }
      if (this.hasAppendSlot || this.copy) {
        inputClasses.push('text-truncate');
      }
      if (this.showPassword) {
        inputClasses.push('password-visible');
      }
      return inputClasses;
    },
    /**
     * If the field is invalid, we return a string list of error ids which this field is described by
     */
    ariaDescribedBy() {
      if ((this.valid && !this.errors.length) || !this.fieldErrors) return this.describedbyId || false;

      const combinedErrors = this.errors.concat(this.fieldErrors);
      if (!combinedErrors) return this.describedbyId || false;

      return createAriaDescribedByList(this.name, combinedErrors);
    },
    combinedErrors() {
      return this.errors.concat(this.fieldErrors);
    },
  },
  methods: {
    /**
     * Toggles the display of text for a password
     */
    revealText() {
      if (!this.disabled) {
        this.showPassword = !this.showPassword;
      }
    },
    /**
     * Start animation for floating labels
     */
    animationStart() {
      const node = this.$refs.input;
      const nativeMatches = node.matches || node.msMatchesSelector;
      if (nativeMatches.call(node, ':-webkit-autofill') && this.label) {
        this.floatLabels = true;
      }
    },
    /**
     * Copy field value to clipboard
     *
     * @param {String} payload string to copy
     */
    copyValueToClipboard(payload) {
      clipboard.writeText(payload).then(() => {
        this.displayNotification('success', this.$t('common.copySuccess'));
      }, (error) => {
        this.showErrorMessage(error, this.$t('common.copyFail'));
      });
    },
    /**
    * Default inputValueHandler method.
    *
    * @param {Array|Object|Number|String} newVal value to be set for internal model
    */
    inputValueHandler(newVal) {
      if (this.floatingLabel && newVal !== null) {
        this.floatLabels = newVal.toString().length > 0 && !!this.label;
      }

      this.$emit('input', newVal);
    },
    /**
    * onBlur event handler
    *
    * @param {Object} event event object emitted by vue-multiselect during blur
    */
    onBlur(event) {
      this.$emit('blur', event);
      if (this.floatingLabel && this.label) {
        this.floatLabels = this.inputValue.toString().length > 0;
      }
    },
    /**
     * Formats the number input by removing any characters that aren't 0-9, -, .
     * Note: This is due to accessibility concerns with input type="number".
     *       Accessibility changes implemented as part of this work:
     *       https://bugster.forgerock.org/jira/browse/IAM-3677
     */
    removeNonNumericChars({ target }) {
      const newVal = target?.value;
      // Passing - or . to parseFloat returns NaN
      // This allows negatives and decimals to be entered
      const justHyphen = newVal.length === 1 && newVal.startsWith('-');
      const justPeriod = newVal.length === 1 && newVal.startsWith('.');

      if (newVal && (typeof newVal === 'string') && !justHyphen && !justPeriod) {
        const numericString = newVal.replace(/[^0-9-.]/g, '');
        const parsedVal = parseFloat(numericString);
        let returnedVal = Number.isNaN(parsedVal) ? '' : parsedVal;
        // If a number with just a period at the end is passed to parseFloat, it removes the period
        // this allows decimals to be entered
        if (numericString.endsWith('.') && !parsedVal.toString().endsWith('.')) {
          returnedVal = numericString.length === 1 ? '.' : `${parsedVal}.`;
        }
        if (numericString === '-' && returnedVal === '') {
          returnedVal = '-';
        }
        if (numericString === '-.') {
          returnedVal = '.';
        }
        return returnedVal;
      }
      return newVal;
    },
  },
};
</script>

<style lang="scss" scoped>
  .form-control.is-invalid {
    background-image: none;
  }

  .password-field input[type=text],
  .password-field input[type=password] {
    padding-right: 0px;
  }

  :deep(.prepend-button .within-input-button .btn) {
    margin-left: -1px;
    border-radius: 0 !important;
  }

  :deep(.prepend-button:only-child .within-input-button .btn) {
    // Give button the correct padding inside the input field
    padding: 0.75rem 1.25rem !important;
    // Gives button a curved border on the right hand side
    border-top-right-radius: $border-radius !important;
    border-bottom-right-radius: $border-radius !important;
  }

  :deep(.prepend-button:not(:only-child) .btn) {
    padding: 0.75rem !important;
  }

  :deep(.within-input-button:not(.floating-label .within-input-button)) {
    align-self: flex-end;
  }

  :deep(.within-input-button .btn) {
    background-color: $white !important;
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
    border-left: 0 !important;

    &:active,
    &:hover,
    &:focus,
    &:active:focus {
      box-shadow: none !important;
      // Fix for password show/hide button content disappearing on active
      // because colour changed to white
      color: $gray-800 !important;
    }
  }

  // If the secret input also contains an esv dropdown button this will adjust
  // the padding to be correct for when both buttons are showing
  .has-prepend-btn .within-input-button .btn {
    padding-left: 0.75rem !important;
  }

  .form-label-group.fr-field-error .within-input-button .btn {
    // Fix for password show/hide button right border radius being 0 when it needs
    // to match the input
    border-bottom-right-radius: $border-radius !important;
    border-top-right-radius: $border-radius !important;

    // Fix for password show/hide button border changing to gray on active
    border-color: $danger !important;
  }

  .form-label-group:not(.fr-field-error) {
    .form-control {
      &:focus {
        border-color: $primary;
        -webkit-box-shadow: 0 0 0 0.0625rem $primary;
        box-shadow: 0 0 0 0.0625rem $primary;
      }
    }
  }
  .form-label-group.fr-field-error {
    .form-control {
      &:focus {
        border-color: $danger !important;
        -webkit-box-shadow: 0 0 0 0.0625rem $danger !important;
        box-shadow: 0 0 0 0.0625rem $danger !important;
      }
    }
  }

  .form-label-group:focus-within {
       .input-buttons:not(:focus-within) .within-input-button .btn {
            border-color: $primary;
            clip-path: inset(-1px -1px -1px 0px) !important;
            box-shadow: 0 0 0 0.0625rem $primary;
       }
       &.fr-field-error .input-buttons:not(:focus-within) .within-input-button .btn {
            border-color: $danger !important;
            clip-path: inset(-1px -1px -1px 0px) !important;
            box-shadow: 0 0 0 0.0625rem $danger !important;
       }
  }

  :deep(.material-icons), :deep(.material-icons-outlined) {
    line-height: 1.125rem;
  }

  :deep(.btn.clear-btn),
  :deep(.btn.clear-btn):active,
  :deep(.btn.clear-btn):focus {
    border-left: none !important;
    background-color: $gray-100 !important;
    color: $gray-800 !important;
  }

  /* Styles used to ensure Chrome's password save still triggers label move */
  /* stylelint-disable */
  input:-webkit-autofill {
    animation-name: onAutoFillStart;
    box-shadow: 0 0 0 0 #e8f0fe inset;
  }

  @keyframes onAutoFillStart {
    from { /*  */ }
    to { /*  */ }
  }
  /* stylelint-enable */
</style>
