<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    class="mb-4">
    <p
      class="text-center mb-4"
      v-if="apiType">
      {{ $t(`pages.selfservice.headers.${apiType}.description`) }}
    </p>
    <div class="recaptcha-wrapper ">
      <div class="recaptcha-bound">
        <div id="recaptchaContainer" />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
  * @description Selfservice stage for multiple selfservice flows, displays a google captcha
  *
  * */
import { ref, onMounted } from 'vue';
import { isUndefined } from 'lodash';
import { displayNotification } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const props = defineProps({
  advanceStage: {
    type: Boolean,
    default: false,
  },
  selfServiceDetails: {
    type: Object,
    required: true,
  },
  apiType: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['advance-stage']);

const recaptchaResponse = ref('');

function getData() {
  return {
    response: recaptchaResponse.value,
    'g-recaptcha-response': recaptchaResponse.value,
  };
}

function handleCaptchaCallback(response) {
  recaptchaResponse.value = response;
  emit('advance-stage', getData());
}

function loadRecaptcha() {
  if (isUndefined(props.selfServiceDetails.requirements.properties.response.recaptchaSiteKey) || props.selfServiceDetails.requirements.properties.response.recaptchaSiteKey.length === 0) {
    displayNotification('error', i18n.global.t('pages.selfservice.captchaError'));
  } else {
    setTimeout(() => {
      if (typeof window.grecaptcha === 'undefined') {
        loadRecaptcha();
      } else {
        window.grecaptcha.render('recaptchaContainer', {
          sitekey: props.selfServiceDetails.requirements.properties.response.recaptchaSiteKey,
          callback: handleCaptchaCallback,
        });
      }
    }, 500);
  }
}

onMounted(() => {
  const recaptchaScript = document.createElement('script');
  recaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js');
  document.head.appendChild(recaptchaScript);

  loadRecaptcha();
});
</script>
