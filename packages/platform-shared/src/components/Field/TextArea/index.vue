<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrInputLayout
    :id="internalId"
    :name="name"
    :description="description"
    :errors="combinedErrors"
    :is-html="isHtml"
    :label="label"
    :show-length-count="showLengthCount"
    :current-length="inputValue?.length"
    :max-length="maxLength"
    :floating-label="floatingLabel">
    <template #default="{ helpTextId }">
      <textarea
        ref="input"
        :value="inputValue"
        @input="inputValue = $event.target.value; $emit('input', inputValue)"
        v-on="validationListeners"
        :autofocus="autofocus"
        :class="[{'polyfill-placeholder': floatLabels }, 'form-control', 'mh-50px', addClass]"
        :cols="cols"
        :data-vv-as="label"
        :disabled="disabled"
        :id="internalId"
        :name="name"
        :aria-describedby="describedByIds(helpTextId)"
        :aria-invalid="isAriaInvalid"
        :placeholder="floatingLabel ? false : placeholder"
        :rows="rows"
        :max-rows="maxRows"
        :readonly="readonly"
        :data-testid="testid"
        :aria-required="isRequiredAria"
        @click="handleFocusEvent"
        @focus="handleFocusEvent"
        @keydown="$emit('keydown', $event)"
        @blur="onBlur($event, inputValue)"
      />
    </template>
    <template #defaultButtons>
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
</template>

<script>
import { useField } from 'vee-validate';
import { v4 as uuid } from 'uuid';
import { ref, toRef, watch } from 'vue';
import * as clipboard from 'clipboard-polyfill/text';
import { BInputGroupAppend, BTooltip } from 'bootstrap-vue';
import { debounce } from 'lodash';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import { createAriaDescribedByList } from '@forgerock/platform-shared/src/utils/accessibilityUtils';
import FrInputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 *  Text area input
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @param {String} value default ''
 */
export default {
  name: 'TextArea',
  mixins: [
    InputMixin,
    NotificationMixin,
  ],
  components: {
    BInputGroupAppend,
    BTooltip,
    FrIcon,
    FrInputLayout,
  },
  props: {
    /**
     * specifies the visible height of a text area, in lines.
     */
    rows: {
      type: Number,
      default: 3,
    },
    /**
     * specifies the visible width of a text area.
     */
    cols: {
      type: Number,
      default: 10,
    },
    /**
     * Specifies whether to show an input length count under the text area
     */
    showLengthCount: {
      type: Boolean,
      default: false,
    },
    /**
     * Specifies the max length to show in the input count
     */
    maxLength: {
      type: Number,
      default: 500,
    },
    addClass: {
      type: String,
      default: '',
    },
    /**
     * Specifies the maximum number of rows the textarea will grow to in order to fit content
     */
    maxRows: {
      type: Number,
      default: null,
    },
    testid: {
      type: String,
      default: '',
    },
    /**
     * Determines if copy button should be appended to field
     */
    copy: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const {
      value: inputValue, errors: fieldErrors, meta, handleBlur, validate,
    } = useField(() => `${props.name}-id-${uuid()}`, toRef(props, 'validation'), {
      validateOnMount: props.validationImmediate, initialValue: '', bails: false, validateOnValueUpdate: false, label: toRef(props, 'label'),
    });
    const wasInvalid = ref(false); // Track invalid state
    const debouncedValidate = debounce(validate, 250);

    // Watch input changes: Validate aggressively if previously invalid
    watch(inputValue, () => {
      if (wasInvalid.value) {
        debouncedValidate();
      }
    });

    // Watch errors to transition between validation modes
    watch(fieldErrors, (newErrors) => {
      if (newErrors.length === 0) {
        wasInvalid.value = false; // Reset to eager validation
      } else {
        wasInvalid.value = true; // Stay aggressive while invalid
      }
    });

    // validationListeners: Contains custom event listeners for validation.
    // Since vee-validate +4 removes the interaction modes, this custom listener is added
    // to validate on blur to perform a similar aggressive validation in addition to the validateOnValueUpdate.
    const validationListeners = {
      blur: (evt) => {
        handleBlur(evt, true);
        validate(); // Validate immediately on blur
        wasInvalid.value = fieldErrors.value.length > 0;
      },
    };

    return {
      inputValue, fieldErrors, meta, validationListeners,
    };
  },
  mounted() {
    // Ensure the input is focused if autofocus is true
    if (this.autofocus) {
      setTimeout(() => {
        if (this.$refs.input) {
          this.$refs.input.focus();
        }
      }, 200);
    }
  },
  methods: {
    /**
     * Handler for click and focus events on textarea.
     * Floats the label if possible
     */
    handleFocusEvent(event) {
      if (this.label && !this.readonly && this.floatingLabel) {
        this.floatLabels = true;
      }
      this.$emit('focus', event);
    },

    /**
     * Handles blur event on the textarea.
     *
     * @param {Event} event - The native blur event
     * @param {Array|Object|Number|String} inputValue - input value to be set for internal model
     */
    onBlur(event, inputValue) {
      this.inputValueHandler(inputValue);
      this.$emit('blur', event);
    },

    /**
    * Default inputValueHandler method.
    *
    * @param {Array|Object|Number|String} inputValue value to be set for internal model
    */
    inputValueHandler(inputValue) {
      if (inputValue !== null && this.floatingLabel) {
        this.floatLabels = inputValue.toString().length > 0 && !!this.label;
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
     * Returns the ids of the elements describing textarea for `aria-describedby` attribute:
     * the ids of the validation errors, when present, followed by the `describedbyId` prop
     * and the id of the help text, when a description exists, composed together (as
     * `aria-describedby` accepts multiple ids, matching BasicInput/DateInput/SelectInput).
     *
     * @param {String} helpTextId - id of the description rendered by InputLayout, passed through the default slot scope
     */
    describedByIds(helpTextId) {
      const _helpTextId = [this.describedbyId, helpTextId].filter(Boolean).join(' ') || undefined;
      if (!this.combinedErrors.length) {
        return _helpTextId || undefined;
      }

      const errorIds = createAriaDescribedByList(this.name, this.combinedErrors);
      return [errorIds, _helpTextId].filter(Boolean).join(' ') || undefined;
    },
  },
  computed: {
    /**
     * Determines the `aria-invalid` attribute's state on validation.
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
  },
};
</script>

<style lang="scss" scoped>
  .mh-50px {
    min-height: 50px;
  }
</style>
