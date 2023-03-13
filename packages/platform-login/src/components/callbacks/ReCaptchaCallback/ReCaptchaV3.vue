<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div />
</template>

<script>
/**
 * @description Selfservice stage for multiple selfservice flows, displays a google captcha
 *
 * */
import Vue from 'vue';
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import { VueReCaptcha } from 'vue-recaptcha-v3';

export default {
  name: 'ReCaptchaV3',
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
    const recaptchaSiteKey = this.callback.getSiteKey();
    Vue.use(VueReCaptcha, {
      siteKey: recaptchaSiteKey,
    });
    this.$emit('next-step-callback', this.runRecaptcha);
    this.$emit('disable-next-button', true);
  },
  methods: {
    runRecaptcha() {
      return this.$recaptchaLoaded()
        .then(() => this.$recaptcha('login')
          .then((token) => {
            this.callback.setInputValue(token);
            this.$emit('disable-next-button', false);
          }))
        .catch(() => {
          this.handleCaptchaError();
        });
    },
    handleCaptchaError() {
      this.displayNotification('error', this.$t('pages.selfservice.captchaError'));
    },
  },
};
</script>
