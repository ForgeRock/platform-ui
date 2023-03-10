<!-- Copyright (c) 2021-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
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
    <template v-slot="{ labelHeight }">
      <!--
        slot scoped variable labelHeight is used to change the height of the input as follows:
        - the label height is calculated as labelHeight + 2px (border of label)
        - padding top is calculated as labelHeight - 27px (size of label text with floating label)
      -->
      <input
        v-if="fieldType === 'number'"
        v-model.number="inputValue"
        ref="input"
        type="number"
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
        :placeholder="floatingLabel ? label : placeholder"
        :readonly="readonly"
        :style="labelHeight && {height: `${labelHeight + 2}px`, 'padding-top': `${labelHeight - 27}px`}"
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
            'text-truncate' : copy,
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
      v-slot:[slotName]="slotData">
      <!-- @slot passthrough slot -->
      <slot
        :name="slotName"
        v-bind="slotData" />
    </template>
  </FrInputLayout>
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
  },
  data() {
    return {
      showPassword: false,
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
      return this.type === 'password' && !this.showPassword ? 'password' : 'text';
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
