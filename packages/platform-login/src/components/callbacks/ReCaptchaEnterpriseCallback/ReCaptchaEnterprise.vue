<!-- Copyright (c) 2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div />
</template>

<script setup>
/**
 * @description Callback for the RecaptchaEnterprise Node
 * */

import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import i18n from '@/i18n';

const props = defineProps({
  callback: {
    type: Object,
    required: true,
  },
});

const recaptchaSiteKey = props.callback.getSiteKey();
const recaptchaApiUrl = props.callback.getApiUrl();
const recaptchaClass = props.callback.getElementClass();

const injectRecaptchaScript = () => {
  // Append a new script to head to load recaptcha using the api url and site
  // key set in the nodes configuration
  const scriptSrc = `${recaptchaApiUrl}?render=${recaptchaSiteKey}`;
  // Ensure script has not already been added to the page
  if (!document.querySelector(`script[src='${scriptSrc}']`)) {
    // Create the script
    const recaptchaScript = document.createElement('script');
    recaptchaScript.setAttribute('src', scriptSrc);

    // Add event listener to wait for the script to load
    recaptchaScript.addEventListener('load', () => {
      try {
        // When recaptcha is ready
        window.grecaptcha.enterprise.ready(async () => {
          // Set the recaptcha containers class to the class set in the node config
          const recaptchaContainer = document.querySelector('.grecaptcha-badge').parentElement;
          recaptchaContainer.classList.add(recaptchaClass);

          // Wait for recaptcha to generate a token and set the callbacks value
          const token = await window.grecaptcha.enterprise.execute(recaptchaSiteKey, { action: 'LOGIN' });
          props.callback.setResult(token);
        });
      } catch (error) {
        showErrorMessage(error, i18n.global.t('pages.selfservice.captchaError'));
      }
    });

    // Add the script to head
    document.head.appendChild(recaptchaScript);
  }
};

injectRecaptchaScript();
</script>
