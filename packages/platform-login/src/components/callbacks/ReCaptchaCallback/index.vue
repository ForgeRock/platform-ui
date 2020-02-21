<!-- Copyright 2019-2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
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
        <div id="recaptchaContainer" />
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @description Selfservice stage for multiple selfservice flows, displays a google captcha
 *
 * */
import { isUndefined } from 'lodash';
import NotificationMixin from '@forgerock/platform-components/src/mixins/NotificationMixin';

export default {
  name: 'ReCaptchaCallback',
  mixins: [
    NotificationMixin,
  ],
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
    const recaptchaScript = document.createElement('script');

    recaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js');
    document.head.appendChild(recaptchaScript);
  },
  mounted() {
    this.name = `callback_${this.index}`;

    this.recaptchaSiteKey = this.callback.getSiteKey();

    this.loadRecaptcha();
  },
  methods: {
    loadRecaptcha() {
      if (isUndefined(this.recaptchaSiteKey) || this.recaptchaSiteKey.length === 0) {
        this.displayNotification('IDMMessages', 'error', this.$t('pages.selfservice.captchaError'));
      } else {
        setTimeout(() => {
          if (typeof window.grecaptcha === 'undefined') {
            this.loadRecaptcha();
          } else {
            window.grecaptcha.render('recaptchaContainer', {
              sitekey: this.recaptchaSiteKey,
              callback: this.handleCaptchaCallback,
            });
          }
        }, 500);
      }
    },
    handleCaptchaCallback(response) {
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
