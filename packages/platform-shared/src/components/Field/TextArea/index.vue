<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

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
    <textarea
      v-model="inputValue"
      :autofocus="autofocus"
      :class="[{'polyfill-placeholder': floatLabels }, 'white-label-background form-control']"
      :cols="cols"
      :data-vv-as="label"
      :disabled="disabled"
      :id="id"
      :name="name"
      :placeholder="label"
      :rows="rows"
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
  },
  methods: {
    onClick() {
      if (this.label) {
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
