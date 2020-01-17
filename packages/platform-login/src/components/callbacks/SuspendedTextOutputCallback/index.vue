<!-- Copyright 2019 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
