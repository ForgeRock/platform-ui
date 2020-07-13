<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
  <div
    class="row ml-1 mb-2"
    ref="textOutputPanel">
    <div class="text-center text-muted w-100">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  props: {
    callback: {
      type: Object,
      required: true,
    },
  },
  mounted() {},
  data() {
    return {
      message: this.callback.getOutputValue(),
    };
  },
};
</script>
