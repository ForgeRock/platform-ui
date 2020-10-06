<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <div
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
  components: {
    FrSpinner: Spinner,
  },
  props: {
    callback: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      message: '',
      interval: undefined,
    };
  },
  mounted() {
    this.message = this.callback.getMessage();
    this.interval = setInterval(() => {
      this.$emit('next-step', null, true);
    }, this.callback.getWaitTime());
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
};
</script>
