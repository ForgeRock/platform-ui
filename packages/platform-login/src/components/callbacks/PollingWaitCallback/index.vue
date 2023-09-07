<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    v-if="!hideSpinnerAndMessage"
    class="polling-spinner-container row justify-content-center">
    <FrSpinner
      class="mb-4"
      label="Spinning" />
    <div class="text-center text-muted w-100">
      {{ message }}
    </div>
  </div>
</template>
<script>
import Spinner from '@forgerock/platform-shared/src/components/Spinner/';

export default {
  name: 'PollingWaitCallback',
  components: {
    FrSpinner: Spinner,
  },
  props: {
    callback: {
      type: Object,
      required: true,
    },
    hideSpinnerAndMessage: {
      type: Boolean,
      default: null,
    },
  },
  data() {
    return {
      message: '',
      timeout: undefined,
    };
  },
  watch: {
    callback: {
      immediate: true,
      handler() {
        this.callTimeout();
      },
    },
  },
  methods: {
    callTimeout() {
      this.message = this.callback.getMessage();
      this.timeout = setTimeout(() => {
        this.$emit('next-step', null, true);
      }, this.callback.getWaitTime());
    },
  },
  beforeUnmount() {
    clearTimeout(this.timeout);
  },
};
</script>
