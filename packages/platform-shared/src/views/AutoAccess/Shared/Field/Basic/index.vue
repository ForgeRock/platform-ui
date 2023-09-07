<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrInputLayout
    :id="id"
    :field-name="fieldName"
    :help-text="helpText"
    :errors="errors"
    :is-html="isHtml"
    :label="label">
    <input
      :type="fieldType"
      :id="id"
      :class="[{'polyfill-placeholder': floatLabels, 'is-invalid': errorMessages && errorMessages.length }, 'form-control']"
      v-model="inputValue"
      :placeholder="label"
      :data-vv-as="label"
      :disabled="disabled"
      :readonly="readonly"
      @input="evt=>inputValue=evt.target.value"
      @keyup="validator"
      @animationstart="animationStart"
      ref="input"
      :name="fieldName">
    <template #defaultButtons>
      <BInputGroupAppend
        class="fr-hide-input"
        v-if="type === 'password'">
        <BButton
          @click="revealText"
          :class="[{'disabled': disabled}]"
          name="revealButton"
          @keyup.enter="$emit('enter')">
          <i class="material-icons material-icons-outlined">
            <template v-if="showPassword">
              visibility_off
            </template>
            <template v-else>
              visibility
            </template>
          </i>
        </BButton>
      </BInputGroupAppend>
      <BInputGroupAppend
        v-if="$attrs.copy">
        <button
          :id="`copyButton-${value}`"
          class="btn btn-outline-secondary"
          name="copyButton"
          @click.prevent="copyValueToClipboard(value)">
          <i class="material-icons material-icons-outlined">
            copy
          </i>
        </button>
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
import {
  BButton,
  BInputGroupAppend,
} from 'bootstrap-vue';
import { delay } from 'lodash';
import * as clipboard from 'clipboard-polyfill/text';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
import InputLayout from '../Wrapper/InputLayout';
import InputMixin from '../Wrapper/InputMixin';

/**
 * Input with a floating label in the center, this will move when a user types into the input (example can be found on the default login page).
 *
 *  @Mixes InputMixin - default props and methods for inputs
 *  @prop {boolean} disabled default false
 *  @prop {string} fieldName default ''
 *  @prop {string} helpText default ''
 *  @prop {string} label default ''
 *  @prop {array|object} failedPolicies default {}
 *  @prop {function} validator default noop
 *  @prop {Array|Object|Number|String} value default ''
 */
export default {
  name: 'BasicInput',
  mixins: [
    InputMixin,
    NotificationMixin,
  ],
  components: {
    BButton,
    BInputGroupAppend,
    FrInputLayout: InputLayout,
  },
  props: {
    /**
     * Autofocus field.
     */
    autofocus: {
      type: Boolean,
      default: false,
    },
    /**
     * List of errors related to input value
     */
    errors: {
      type: Array,
      default: () => [],
    },
    /**
     * Input type password|text
     */
    type: {
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
    revealText() {
      if (!this.disabled) {
        this.showPassword = !this.showPassword;
      }
    },
    animationStart() {
      const node = this.$refs.input;
      const nativeMatches = node.matches || node.msMatchesSelector;
      if (nativeMatches.call(node, ':-webkit-autofill') && this.label) {
        this.floatLabels = true;
      }
    },
    copyValueToClipboard(payload) {
      clipboard.writeText(payload).then(() => {
        this.displayNotification('success', this.$t('common.copySuccess'));
      }, (error) => {
        this.showErrorMessage(error, this.$t('common.copyFail'));
      });
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
