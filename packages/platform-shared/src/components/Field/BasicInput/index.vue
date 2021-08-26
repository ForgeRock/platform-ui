<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <FrInputLayout
    :id="id"
    :name="name"
    :description="description"
    :errors="errors"
    :is-html="isHtml"
    :label="label"
    :validation="validation"
    :validation-immediate="validationImmediate">
    <input
      v-if="fieldType === 'number'"
      v-model.number="inputValue"
      ref="input"
      type="number"
      :class="[{'polyfill-placeholder': floatLabels, 'is-invalid': errorMessages && errorMessages.length, 'text-truncate' : $attrs.copy }, 'form-control']"
      :data-vv-as="label"
      :disabled="disabled"
      :id="id"
      :name="name"
      :placeholder="label"
      :readonly="readonly"
      @animationstart="animationStart">
    <input
      v-else
      v-model="inputValue"
      ref="input"
      :class="[{'polyfill-placeholder': floatLabels, 'is-invalid': errorMessages && errorMessages.length, 'text-truncate' : $attrs.copy }, 'form-control']"
      :data-vv-as="label"
      :disabled="disabled"
      :id="id"
      :name="name"
      :placeholder="label"
      :readonly="readonly"
      :type="fieldType"
      :aria-label="label"
      @input="evt=>inputValue=evt.target.value"
      @animationstart="animationStart">
    <template #defaultButtons>
      <BInputGroupAppend
        class="fr-hide-input"
        v-if="type === 'password'">
        <BButton
          @click="revealText"
          :class="[{'disabled': disabled}]"
          name="revealButton"
          :aria-label="showPassword ? 'visibility_off' : 'visibility'"
          @keyup.enter="$emit('enter')">
          <FrIcon
            :name="showPassword ? 'visibility_off' : 'visibility'"
          />
        </BButton>
      </BInputGroupAppend>
      <BInputGroupAppend
        v-if="$attrs.copy">
        <button
          :id="`copyButton-${value}`"
          class="btn btn-outline-secondary"
          name="copyButton"
          @click.prevent="copyValueToClipboard(value)">
          <FrIcon
            name="copy"
          />
        </button>
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
} from 'bootstrap-vue';
import { delay } from 'lodash';
/* eslint-disable import/no-extraneous-dependencies */
import * as clipboard from 'clipboard-polyfill/text';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin/';
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
  ],
  components: {
    BButton,
    BInputGroupAppend,
    FrIcon,
    FrInputLayout,
  },
  props: {
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
        this.displayNotification('IDMMessages', 'success', this.$t('common.copySuccess'));
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
      if (newVal !== null) {
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
