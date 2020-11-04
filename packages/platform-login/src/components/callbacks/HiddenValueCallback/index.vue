<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <div class="row hidden">
    <input
      type="hidden"
      :name="name"
      :ref="name"
      :id="value"
      v-model="value"
      @input="onChange">
  </div>
</template>

<script>

export default {
  name: 'HiddenValueCallback',
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
      value: '',
    };
  },
  methods: {
    onChange() {
      this.callback.setInputValue(this.value);
    },
  },
};
</script>
