<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <BButton
      v-for="(option, index) in options"
      :key="index"
      class="btn-block mt-3"
      :variant="variant"
      @click="setValue(index)">
      {{ option }}
    </BButton>
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue';

export default {
  name: 'ConfirmationCallback',
  components: {
    BButton,
  },
  props: {
    callback: {
      type: Object,
      required: true,
    },
    variant: {
      type: String,
      default: 'primary',
    },
  },
  mounted() {
    this.options = this.callback.getOptions();
  },
  data() {
    return {
      options: [],
    };
  },
  methods: {
    setValue(value) {
      this.callback.setInputValue(value);
      this.$emit('next-step');
    },
  },
};
</script>
