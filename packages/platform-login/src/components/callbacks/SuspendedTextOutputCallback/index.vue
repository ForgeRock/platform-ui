<!-- Copyright (c) 2020-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="row ml-1 mb-2"
    ref="textOutputPanel">
    <div
      data-testid="suspend-text-output"
      class="text-center text-muted w-100 white-space-pre-line"
      role="alert"
      v-html="sanitizedMessage" />
  </div>
</template>

<script>
export default {
  name: 'SuspendedTextOutputCallback',
  props: {
    callback: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      sanitizedMessage: this.$sanitize(this.callback.getOutputValue()),
    };
  },
};
</script>

<style lang="scss" scoped>

.white-space-pre-line {
  white-space: pre-line;
}

</style>
