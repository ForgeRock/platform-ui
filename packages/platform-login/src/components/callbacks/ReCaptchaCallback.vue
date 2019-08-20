<template>
  <div
    id="captchaBody"
    class="mb-4 d-inline"
  >
    <input
      type="hidden"
      :name="name"
      :ref="name"
      :value="value"
    >
    <div
      class="recaptcha-wrapper "
    >
      <div
        class="recaptcha-bound"
      >
        <div
          id="recaptchaContainer"
        />
      </div>
    </div>
  </div>
</template>

<script>
/**
 * @description Selfservice stage for multiple selfservice flows, displays a google captcha
 *
 * */
import {
  mapValues, keyBy, isUndefined,
} from 'lodash';
import CallbackValidation from '@/utils/CallbackValidation';

export default {
  name: 'ReCaptchaCallback',
  props: {
    callback: {
      type: Object,
      validator: CallbackValidation.validateOutput,
      required: true,
    },
    index: {
      type: Number,
      default: 0,
    },
    prompt: {
      type: String,
      default: '',
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
    const callbackOutput = mapValues(keyBy(this.callback.output, 'name'), v => v.value);

    this.name = `callback_${this.index}`;

    this.recaptchaSiteKey = callbackOutput.recaptchaSiteKey;

    this.loadRecaptcha();
  },
  methods: {
    loadRecaptcha() {
      /* istanbul ignore next */
      if (isUndefined(this.recaptchaSiteKey) || this.recaptchaSiteKey.length === 0) {
        this.displayNotification('error', this.$t('pages.selfservice.captchaError'));
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
    },
  },
};
</script>
<style>
    #captchaBody #recaptchaContainer>div {
        margin: auto;
    }
    #captchaBody #recaptchaContainer>div>div {
        display: inline-block;
    }
</style>
