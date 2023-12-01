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
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';

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
  async created() {
    const recaptchaSiteKey = this.callback.getSiteKey();
    this.$loadVueRecaptcha(recaptchaSiteKey);
    this.$emit('next-step-callback', this.runRecaptcha);
  },
  methods: {
    runRecaptcha() {
      return this.$recaptchaLoaded()
        .then(() => this.$recaptcha('login')
          .then((token) => {
            this.callback.setInputValue(token);
          }))
        .catch(() => {
          this.handleCaptchaError();
        });
    },
    handleCaptchaError() {
      this.showErrorMessage('error', this.$t('pages.selfservice.captchaError'));
    },
  },
};
</script>
