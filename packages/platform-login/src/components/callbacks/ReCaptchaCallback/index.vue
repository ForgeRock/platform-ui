<!-- Copyright (c) 2020-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <span>
    <Component
      :is="reCaptchaComponentVersion"
      :callback="callback"
      :index="index"
      v-on="$listeners"
    />
  </span>
</template>

<script>

export default {
  name: 'ReCaptchaCallback',
  components: {
    ReCaptchaV2: () => import('@/components/callbacks/ReCaptchaCallback/ReCaptchaV2'),
    ReCaptchaV3: () => import('@/components/callbacks/ReCaptchaCallback/ReCaptchaV3'),
  },
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
  data() {
    return {
      reCaptchaComponentVersion: undefined,
    };
  },
  created() {
    this.reCaptchaComponentVersion = this.callback.getOutputByName('reCaptchaV3') ? 'ReCaptchaV3' : 'ReCaptchaV2';
  },
};
</script>
