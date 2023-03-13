<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <VueHcaptcha
    :sitekey="this.callback.getSiteKey()"
    @error="handleCaptchaError"
    @verify="handleCaptchaVerify" />
</template>

<script>
/**
 * @description Selfservice stage for multiple selfservice flows, displays an hcaptcha
 *
 * */
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import VueHcaptcha from '@hcaptcha/vue-hcaptcha';

export default {
  name: 'HCaptchaV1',
  components: {
    VueHcaptcha,
  },
  mixins: [
    NotificationMixin,
  ],
  props: {
    callback: {
      type: Object,
      required: true,
    },
  },
  created() {
    this.$emit('disable-next-button', true);
  },
  methods: {
    handleCaptchaVerify(token) {
      this.callback.setInputValue(token);
      this.$emit('disable-next-button', false);
    },
    handleCaptchaError() {
      this.showErrorMessage('error', this.$t('pages.selfservice.captchaError'));
    },
  },
};
</script>
