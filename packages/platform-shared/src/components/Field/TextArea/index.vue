<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

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
    :validation-immediate="validationImmediate"
    :show-length-count="showLengthCount"
    :current-length="inputValue.length"
    :max-length="maxLength">
    <textarea
      v-model="inputValue"
      :autofocus="autofocus"
      :class="[{'polyfill-placeholder': floatLabels }, 'form-control', addClass]"
      :cols="cols"
      :data-vv-as="label"
      :disabled="disabled"
      :id="id"
      :name="name"
      :placeholder="label"
      :rows="rows"
      :max-rows="maxRows"
      :readonly="readonly"
      :data-testid="testid"
      @input="$emit('input', inputValue)"
      @click="onClick"
      @blur="inputValueHandler(inputValue)" />
  </FrInputLayout>
</template>

<script>
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
};
</script>
