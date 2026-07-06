<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

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
    FriendlyCaptchaV2: () => import('@/components/callbacks/ReCaptchaCallback/FriendlyCaptchaV2'),
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
      // The FriendlyCaptcha v2 widget is delivered as the "@friendlycaptcha/sdk" ES module served
      // from a CDN. We detect it by the package name in the path, but anchored to a trusted CDN
      // hostname so a hostile URL that merely contains the package name cannot select this branch.
      friendlyCaptchaV2: {
        hostnames: ['cdn.jsdelivr.net', 'unpkg.com'],
        packageMarker: '@friendlycaptcha/sdk',
      },
      reCaptchaComponentVersion: undefined,
    };
  },
  created() {
    const apiUri = this.callback.getOutputByName('captchaApiUri', '');
    if (!apiUri) {
      return;
    }
    let url;
    try {
      url = new URL(apiUri);
    } catch {
      // A malformed captchaApiUri (e.g. a relative path with no scheme) must not throw out of the
      // lifecycle hook. Render no captcha component rather than surfacing a Vue error.
      return;
    }
    const domain = url.hostname.replace('www.', '');
    if (this.friendlyCaptchaV2.hostnames.includes(url.hostname)
      && url.pathname.includes(this.friendlyCaptchaV2.packageMarker)) {
      this.reCaptchaComponentVersion = 'FriendlyCaptchaV2';
    } else if (domain === this.captchaTypes.hCaptcha) {
      this.reCaptchaComponentVersion = 'HCaptchaV1';
    } else if (domain === this.captchaTypes.reCaptcha) {
      this.reCaptchaComponentVersion = this.callback.getOutputByName('reCaptchaV3') ? 'ReCaptchaV3' : 'ReCaptchaV2';
    }
  },
};
</script>
