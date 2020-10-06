<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <div class="row text-left ml-1 mb-2">
    <BButton
      v-for="(option, index) in options"
      :key="index"
      class="btn-block mt-3"
      variant="primary"
      @click="setValue(index)">
      {{ option }}
    </BButton>
  </div>
</template>

<script>
import { BButton } from 'bootstrap-vue';

export default {
  components: {
    BButton,
  },
  props: {
    callback: {
      type: Object,
      required: true,
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
