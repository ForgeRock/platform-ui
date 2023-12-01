<!-- Copyright (c) 2022-2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    id="captchaBody"
    class="mb-4 d-inline">
    <input
      type="hidden"
      :name="name"
      :ref="name"
      :value="value">
    <div class="recaptcha-wrapper">
      <div
        class="recaptcha-bound">
        <div id="recaptchaContainer">
          <VueRecaptcha
            ref="tmpRecaptcha"
            v-if="recaptchaSiteKey"
            @verify="handleCaptchaCallback"
            @expired="handleCaptchaError"
            @error="handleCaptchaError"
            :sitekey="recaptchaSiteKey" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @description Selfservice stage for multiple selfservice flows, displays a google captcha
 *
 * */
import NotificationMixin from '@forgerock/platform-shared/src/mixins/NotificationMixin';
import VueRecaptcha from 'vue-recaptcha';

export default {
  name: 'ReCaptchaV2',
  mixins: [
    NotificationMixin,
  ],
  components: {
    VueRecaptcha,
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
      recaptchaSiteKey: '',
      name: '',
      value: '',
    };
  },
  created() {
    this.injectRecaptchaHeadScript();
    this.recaptchaSiteKey = this.callback.getSiteKey();
    this.$emit('disable-next-button', true);
  },
  mounted() {
    this.name = `callback_${this.index}`;
  },
  methods: {
    injectRecaptchaHeadScript() {
      const scriptSrc = 'https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit';
      if (!document.querySelector(`script[src='${scriptSrc}']`)) {
        const recaptchaScript = document.createElement('script');
        recaptchaScript.setAttribute('src', scriptSrc);
        recaptchaScript.setAttribute('async', '');
        recaptchaScript.setAttribute('defer', '');
        document.head.appendChild(recaptchaScript);
      }
    },
    handleCaptchaError() {
      this.showErrorMessage('error', this.$t('pages.selfservice.captchaError'));
    },
    handleCaptchaCallback(response) {
      this.$emit('disable-next-button', false);
      this.value = response;
      this.callback.setInputValue(this.value);
    },
  },
};
</script>

<style>
#recaptchaContainer > div {
  margin: auto;
}

#recaptchaContainer > div > div {
  display: inline-block;
}
</style>
