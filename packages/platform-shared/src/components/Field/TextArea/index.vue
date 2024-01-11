<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

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
    :max-length="maxLength">
    <textarea
      :value="inputValue"
      @input="inputValue = $event.target.value; $emit('input', inputValue)"
      v-on="validationListeners"
      :autofocus="autofocus"
      :class="[{'polyfill-placeholder': floatLabels }, 'form-control', addClass]"
      :cols="cols"
      :data-vv-as="label"
      :disabled="disabled"
      :id="internalId"
      :name="name"
      :placeholder="label"
      :rows="rows"
      :max-rows="maxRows"
      :readonly="readonly"
      :data-testid="testid"
      @click="onClick"
      @blur="inputValueHandler(inputValue)" />
  </FrInputLayout>
</template>

<script>
import { useField } from 'vee-validate';
import { toRef } from 'vue';
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
  mixins: [InputMixin],
  components: {
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
  },
  setup(props) {
    const {
      value: inputValue, errors: fieldErrors, handleBlur,
    } = useField(() => props.name, toRef(props, 'validation'), { validateOnMount: props.validationImmediate, initialValue: '', bails: false });

    // validationListeners: Contains custom event listeners for validation.
    // Since vee-validate +4 removes the interaction modes, this custom listener is added
    // to validate on blur to perform a similar aggressive validation in addition to the validateOnValueUpdate.
    const validationListeners = {
      blur: (evt) => handleBlur(evt, true),
    };

    return { inputValue, fieldErrors, validationListeners };
  },
  methods: {
    /**
     * Handler for clicking the text area. Floats the label if possible
     */
    onClick() {
      if (this.label && !this.readonly) {
        this.floatLabels = true;
      }
    },
    /**
    * Default inputValueHandler method.
    *
    * @param {Array|Object|Number|String} inputValue value to be set for internal model
    */
    inputValueHandler(inputValue) {
      if (inputValue !== null) {
        this.floatLabels = inputValue.toString().length > 0 && !!this.label;
      }
    },
  },
  computed: {
    combinedErrors() {
      return this.errors.concat(this.fieldErrors);
    },
  },
};
</script>
