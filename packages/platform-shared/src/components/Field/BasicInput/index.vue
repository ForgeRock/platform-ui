<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <ValidationObserver
    slim
    ref="basic-input"
    v-slot="validationObserver">
    <FrInputLayout
      :id="id"
      :name="name"
      :description="description"
      :errors="errors"
      :floating-label="floatingLabel"
      :is-html="isHtml"
      :label="label"
      :validation="validation"
      :validation-immediate="validationImmediate">
      <template #default="{ labelHeight }">
        <!--
        slot scoped variable labelHeight is used to change the height of the input as follows:
        - the label height is calculated as labelHeight + 2px (border of label)
        - padding top is calculated as labelHeight - 27px (size of label text with floating label)
      -->
        <input
          v-if="fieldType === 'number'"
          :value="inputValue"
          ref="input"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          :class="[
            'form-control',
            {
              'polyfill-placeholder': floatLabels,
              'is-invalid': errorMessages && errorMessages.length,
              'text-truncate' : copy,
            }
          ]"
          :data-vv-as="label"
          :disabled="disabled"
          :id="id"
          :name="name"
          :min="$attrs.min"
          :placeholder="floatingLabel ? getTranslation(label) : placeholder"
          :readonly="readonly"
          :style="labelHeight && {height: `${labelHeight + 2}px`, 'padding-top': `${labelHeight - 27}px`}"
          @input="event => inputValue = removeNonNumericChars(event)"
          :aria-describedby="getAriaDescribedBy(validationObserver, errors)"
          @animationstart="floatingLabel && animationStart"
          @blur="$emit('blur', $event)"
          :data-testid="`input-${testid}`">
        <input
          v-else
          v-model="inputValue"
          ref="input"
          :class="[
            'form-control',
            {
              'polyfill-placeholder': floatLabels,
              'is-invalid': errorMessages && errorMessages.length,
              'text-truncate' : hasAppendSlot || copy,
            }
          ]"
          :data-vv-as="label"
          :disabled="disabled"
          :id="id"
          :name="name"
          :placeholder="floatingLabel ? getTranslation(label) : placeholder"
          :readonly="readonly"
          :type="fieldType"
          :autocomplete="$attrs.autocomplete"
          :style="labelHeight && {height: `${labelHeight + 2}px`, 'padding-top': `${labelHeight - 27}px`}"
          :aria-describedby="getAriaDescribedBy(validationObserver, errors)"
          @blur="$emit('blur', $event)"
          @input="evt=>inputValue=evt.target.value"
          @animationstart="floatingLabel && animationStart"
          :data-testid="`input-${testid}`">
      </template>
      <template #defaultButtons>
        <BInputGroupAppend
          class="fr-hide-input"
          v-if="type === 'password'">
          <BButton
            @click="revealText"
            :class="[{'disabled': disabled}]"
            name="revealButton"
            :aria-label="showPassword ? $t('common.hidePassword') : $t('common.showPassword')"
            @keyup.enter="$emit('enter')"
            :data-testid="`btn-show-password-${testid}`">
            <FrIcon
              :name="showPassword ? 'visibility_off' : 'visibility'"
            />
          </BButton>
        </BInputGroupAppend>
        <BInputGroupAppend v-if="copy">
          <button
            :id="`copyButton-${value}`"
            :data-testid="`btn-copy-${testid}`"
            class="btn btn-outline-secondary"
            name="copyButton"
            @click.prevent="copyValueToClipboard(value)">
            <FrIcon
              name="copy"
            />
          </button>
          <BTooltip
            :target="`copyButton-${value}`"
            placement="top"
            triggers="hover"
            :title="$t('common.copy')" />
        </BInputGroupAppend>
      </template>

      <template
        v-for="(key, slotName) in $scopedSlots"
        #[slotName]="slotData">
        <!-- @slot passthrough slot -->
        <slot
          :name="slotName"
          v-bind="slotData" />
      </template>
    </FrInputLayout>
  </ValidationObserver>
</template>

<script>
import {
  BButton,
  BInputGroupAppend,
  BTooltip,
} from 'bootstrap-vue';
import { delay, toNumber } from 'lodash';
import * as clipboard from 'clipboard-polyfill/text';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import TranslationMixin from '@forgerock/platform-shared/src/mixins/TranslationMixin';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import { ValidationObserver } from 'vee-validate';
import { createAriaDescribedByList } from '@forgerock/platform-shared/src/utils/accessibilityUtils';
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
    InputMixin,
    NotificationMixin,
    TranslationMixin,
  ],
  components: {
    BButton,
    BInputGroupAppend,
    BTooltip,
    FrIcon,
    FrInputLayout,
    ValidationObserver,
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
     * When true will show the value of a password as text instead of it being hidden
     */
    forceShowPassword: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showPassword: false,
      hasAppendSlot: Object.keys(this.$scopedSlots).includes('append'),
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
    fieldType() {
      if (this.type === 'number') {
        return 'number';
      }
      return this.type === 'password' && !this.showPassword && !this.forceShowPassword ? 'password' : 'text';
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
     * Formats the number input by removing any characters that aren't 0-9.
     * Note: This is due to accessibility concerns with input type="number".
     *       Accessibility changes implemented as part of this work:
     *       https://bugster.forgerock.org/jira/browse/IAM-3677
     */
    removeNonNumericChars({ target }) {
      const newVal = target?.value;
      if (newVal && (typeof newVal === 'string')) {
        const numericString = newVal.replace(/[^\d]/g, '');
        return toNumber(numericString);
      }
      return newVal;
    },
    /**
     * If the field is invalid, we return a string list of error ids which this field is described by
     * @param {ValidationObserver} validationObserver errors from user input
     * @param {Array} parentErrors the errors given to the component by its parent on load
     */
    getAriaDescribedBy({ errors: componentErrors, invalid }, parentErrors) {
      if ((!invalid && !parentErrors.length) || !componentErrors) return this.describedbyId;

      const fieldErrors = componentErrors[this.name];
      const combinedErrors = parentErrors.concat(fieldErrors);
      if (!combinedErrors) return this.describedbyId;

      return createAriaDescribedByList(this.name, combinedErrors);
    },
  },
};
</script>

<style lang="scss" scoped>
  .form-control.is-invalid {
    background-image: none;
  }

  .fr-hide-input {
    position: absolute;
    right: 0;
    bottom: 0;

    .btn {
      background-color: transparent !important;
      border-color: transparent;

      &:active,
      &:hover,
      &:focus,
      &:active:focus {
        box-shadow: none;
      }
    }
  }

  .form-label-group:not(.fr-field-error) {
    .form-control {
      &:focus {
        border-color: $primary !important;
        -webkit-box-shadow: 0 0 0 0.0625rem $primary !important;
        box-shadow: 0 0 0 0.0625rem $primary !important;
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
</style>

<style scoped>
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
