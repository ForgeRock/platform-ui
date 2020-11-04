<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <div class="row text-left mb-2">
    <div class="col-1">
      <input
        type="hidden"
        :name="name"
        :ref="name"
        :value="value">
      <input
        class="ml-1 mt-1"
        type="checkbox"
        :id="'boolean_callback_' + index"
        :value="value"
        :checked="value"
        @change="onToggle()">
    </div>
    <div class="col-10">
      <label
        class="ml-2"
        :for="'boolean_callback_' + index">
        {{ callback.getPrompt() }}
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BooleanAttributeInputCallback',
  props: {
    callback: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
  },
  mounted() {
    this.name = `callback_${this.index}`;
    this.value = this.callback.getInputValue();
  },
  data() {
    return {
      name: '',
      value: false,
    };
  },
  methods: {
    onToggle() {
      this.value = !this.value;
      this.callback.setInputValue(this.value);
    },
  },
};
</script>
