<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="row hidden">
    <input
      type="hidden"
      :name="name"
      :ref="`callback_${this.index}`"
      :id="domId"
      :value="value"
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
  created() {
    // Non-reactive on purpose: the DOM id must stay frozen even if the callback value changes.
    this.domId = this.callback.getOutputByName('id', `callback_${this.index}`);
  },
  mounted() {
    this.name = `callback_${this.index}`;
    this.value = this.callback.getInputValue();
    this.$emit('hidden-value-callback-ref', { ref: this.$refs[this.name], callback: this.callback });
  },
  data() {
    return {
      name: '',
      value: '',
    };
  },
  methods: {
    onChange(value) {
      this.value = value?.target?.value || '';
      this.callback.setInputValue(this.value);
    },
  },
};
</script>
