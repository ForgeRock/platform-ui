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

/**
 * Generate a recaptcha token and set it on the callback
 */
async function executeAndSetToken() {
  try {
    const token = await window.grecaptcha.enterprise.execute(recaptchaSiteKey, { action: 'LOGIN' });
    props.callback.setResult(token);
  } catch (error) {
    showErrorMessage(error, i18n.global.t('pages.selfservice.captchaError'));
  }
}

/**
 * @description Injects the recaptcha script into the head of the document
 * and sets up the recaptcha callback to get a token and set it in the
 * callback's result.
 * */
function injectRecaptchaScript() {
  const scriptSrc = `${recaptchaApiUrl}?render=${recaptchaSiteKey}`;
  // Ensure script has not already been added to the page
  if (!document.querySelector(`script[src='${scriptSrc}']`)) {
    // Create the script
    const recaptchaScript = document.createElement('script');
    recaptchaScript.setAttribute('src', scriptSrc);

    // Add the script to head
    document.head.appendChild(recaptchaScript);

    // Add event listener to wait for the script to load
    recaptchaScript.addEventListener('load', () => {
      // When recaptcha is ready
      window.grecaptcha.enterprise.ready(async () => {
        try {
          // Set the recaptcha containers class to the class set in the node config
          const recaptchaContainer = document.querySelector('.grecaptcha-badge')?.parentElement;
          if (recaptchaContainer) {
            recaptchaContainer.classList.add(recaptchaClass);
          }
          await executeAndSetToken();
        } catch (error) {
          showErrorMessage(error, i18n.global.t('pages.selfservice.captchaError'));
        }
      });
    });
  } else {
    // If a Journey loops back around to this node multiple times, we need to get a new token and add it to the callback
    window.grecaptcha.enterprise.ready(async () => {
      await executeAndSetToken();
    });
  }
}

injectRecaptchaScript();
</script>
