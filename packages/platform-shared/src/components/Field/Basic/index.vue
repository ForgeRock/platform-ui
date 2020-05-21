<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <FrInputLayout
    :id="id"
    :field-name="fieldName"
    :help-text="helpText"
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
      @keyup="validator"
      @animationstart="floatLabels = true"
      ref="input"
      :name="fieldName">
    <template #revealButton>
      <BInputGroupAppend
        v-if="type === 'password'">
        <BButton
          @click="revealText"
          :class="[{'disabled': disabled}, 'btn btn-secondary']"
          type="button"
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
import InputLayout from '../Wrapper/Layout';
import InputMixin from '../Wrapper/Mixin';
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
  mixins: [InputMixin],
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
  computed: {
    fieldType() {
      return this.type === 'password' && !this.showPassword ? 'password' : 'text';
    },
  },
  methods: {
    revealText() {
      if (!this.disabled) {
        this.showPassword = !this.showPassword;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
  .form-control.is-invalid {
    background-image: none;
  }

  /* Styles used to ensure Chrome's password save still triggers label move */
  /* stylelint-disable */
  :-webkit-autofill {
    animation-name: onAutoFillStart;
  }

  @keyframes onAutoFillStart {}
  /* stylelint-enable */
</style>
