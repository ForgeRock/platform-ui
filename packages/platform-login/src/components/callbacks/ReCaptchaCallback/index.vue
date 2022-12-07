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
    HCaptchaV1: () => import('@/components/callbacks/ReCaptchaCallback/HCaptchaV1'),
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
      captchaTypes: {
        hCaptcha: 'hcaptcha.com',
        reCaptcha: 'google.com',
      },
      reCaptchaComponentVersion: undefined,
    };
  },
  created() {
    const url = new URL(this.callback.getOutputByName('captchaApiUri'));
    const domain = url.hostname.replace('www.', '');
    if (domain === this.captchaTypes.hCaptcha) {
      this.reCaptchaComponentVersion = 'HCaptchaV1';
    } else if (domain === this.captchaTypes.reCaptcha) {
      this.reCaptchaComponentVersion = this.callback.getOutputByName('reCaptchaV3') ? 'ReCaptchaV3' : 'ReCaptchaV2';
    }
  },
};
</script>
