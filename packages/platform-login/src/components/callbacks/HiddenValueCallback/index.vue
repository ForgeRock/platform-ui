<!-- Copyright (c) 2020-2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="row hidden">
    <input
      type="hidden"
      :name="name"
      :ref="`callback_${this.index}`"
      :id="callback.getInputValue()"
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
  mounted() {
    this.name = `callback_${this.index}`;
    this.value = this.callback.getInputValue();
    this.$emit('hidden-value-callback-ref', this.$refs[this.name]);
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
