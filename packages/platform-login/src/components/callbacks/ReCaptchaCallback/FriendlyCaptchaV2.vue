<!-- Copyright (c) 2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div
    role="group"
    :aria-label="$t('pages.selfservice.friendlyCaptchaLabel')">
    <div
      :class="`d-flex mx-auto ${divClass}`"
      :data-sitekey="siteKey" />
    <span
      class="sr-only"
      role="status"
      aria-live="polite">
      {{ statusMessage }}
    </span>
  </div>
</template>

<script setup>
/**
 * @description Callback for the CaptchaNode when configured to use FriendlyCaptcha v2.
 *
 * FriendlyCaptcha v2 is delivered as an ES module (the "@friendlycaptcha/sdk" build) which
 * auto-mounts a widget on any element carrying the configured div class and a "data-sitekey"
 * attribute. Completion, expiry and error are surfaced as DOM events rather than through a
 * dedicated Vue wrapper library, so we load the module and wire those events to the callback.
 * */
import {
  onBeforeUnmount, onMounted, ref,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';

// FriendlyCaptcha v2 is served from these CDN hosts (see the FriendlyCaptcha SDK docs and the
// openam friendlycaptcha-setup script). captchaApiUri is a server-supplied callback output, so we
// only ever inject a <script> whose origin is on this allowlist.
const ALLOWED_SDK_HOSTNAMES = ['cdn.jsdelivr.net', 'unpkg.com'];

// The widget states (see the FriendlyCaptcha SDK lifecycle docs) in which a previously collected
// solution is no longer valid and the user must solve the puzzle again. When the widget enters any
// of these - e.g. because the user pressed reset in the widget's menu - we must clear the token and
// re-disable the next button, otherwise a stale/invalidated solution could be submitted.
const INCOMPLETE_WIDGET_STATES = ['reset', 'unactivated', 'activating', 'requesting', 'solving', 'destroyed'];

const props = defineProps({
  callback: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['disable-next-button']);

const { t } = useI18n();

const siteKey = ref('');
const divClass = ref('frc-captcha');
const statusMessage = ref('');

/**
 * Marks the CAPTCHA as unsolved: clears any collected token and disables the next button so an
 * empty or invalidated solution cannot be submitted.
 */
function resetCaptcha() {
  props.callback.setInputValue('');
  emit('disable-next-button', true);
}

/**
 * Handles the widget erroring. Any solution is now invalid, so reset the CAPTCHA and surface an
 * error rather than leaving the next button enabled with a stale token.
 */
function handleCaptchaError() {
  resetCaptcha();
  statusMessage.value = t('pages.selfservice.friendlyCaptchaError');
  showErrorMessage('error', t('pages.selfservice.friendlyCaptchaError'));
}

/**
 * Handles the widget completing successfully. Guards against a malformed event because this is a
 * document-scoped capture-phase listener that runs outside the onMounted try/catch - an unhandled
 * throw here would leave the next button permanently disabled.
 * @param {CustomEvent} event the frc:widget.complete event, whose detail.response is the solution.
 */
function handleCaptchaCallback(event) {
  const response = event?.detail?.response;
  if (!response) {
    handleCaptchaError();
    return;
  }
  props.callback.setInputValue(response);
  statusMessage.value = t('pages.selfservice.friendlyCaptchaComplete');
  emit('disable-next-button', false);
}

/**
 * Handles the widget expiring. The previously collected solution is no longer valid, so reset the
 * CAPTCHA and surface an error to prompt the user to solve it again.
 */
function handleCaptchaExpired() {
  resetCaptcha();
  statusMessage.value = t('pages.selfservice.friendlyCaptchaError');
  showErrorMessage('error', t('pages.selfservice.friendlyCaptchaError'));
}

/**
 * Handles the widget changing state. Completion, expiry and error are covered by their dedicated
 * events; this additionally catches transitions back to an unsolved state (e.g. the user pressing
 * reset in the widget menu), for which the SDK emits no dedicated event, and re-disables the next
 * button so a stale solution cannot be submitted.
 * @param {CustomEvent} event the frc:widget.statechange event, whose detail.state is the new state.
 */
function handleCaptchaStateChange(event) {
  const state = event?.detail?.state;
  if (state && INCOMPLETE_WIDGET_STATES.includes(state)) {
    resetCaptcha();
  }
}

function addCaptchaEventListeners() {
  document.addEventListener('frc:widget.complete', handleCaptchaCallback, true);
  document.addEventListener('frc:widget.expire', handleCaptchaExpired, true);
  document.addEventListener('frc:widget.error', handleCaptchaError, true);
  document.addEventListener('frc:widget.statechange', handleCaptchaStateChange, true);
}

function removeCaptchaEventListeners() {
  document.removeEventListener('frc:widget.complete', handleCaptchaCallback, true);
  document.removeEventListener('frc:widget.expire', handleCaptchaExpired, true);
  document.removeEventListener('frc:widget.error', handleCaptchaError, true);
  document.removeEventListener('frc:widget.statechange', handleCaptchaStateChange, true);
}

function injectFriendlyCaptchaScript() {
  const scriptSrc = props.callback.getOutputByName('captchaApiUri', '');
  if (!scriptSrc) {
    throw new Error('FriendlyCaptcha SDK URL is missing from the callback');
  }
  // Only inject the SDK if it is served from a trusted CDN origin. captchaApiUri comes from the
  // server, so a misconfigured or tampered value must not be able to load arbitrary scripts.
  if (!ALLOWED_SDK_HOSTNAMES.includes(new URL(scriptSrc).hostname)) {
    throw new Error(`Unexpected FriendlyCaptcha SDK origin: ${new URL(scriptSrc).hostname}`);
  }
  // Ensure the SDK module has not already been added to the page
  if (!document.querySelector(`script[src='${scriptSrc}']`)) {
    const friendlyCaptchaScript = document.createElement('script');
    friendlyCaptchaScript.setAttribute('type', 'module');
    friendlyCaptchaScript.setAttribute('src', scriptSrc);
    document.head.appendChild(friendlyCaptchaScript);
  }
}

onMounted(() => {
  siteKey.value = props.callback.getSiteKey();
  const configuredDivClass = props.callback.getOutputByName('captchaDivClass', '');
  if (configuredDivClass) {
    divClass.value = configuredDivClass;
  }
  emit('disable-next-button', true);
  try {
    injectFriendlyCaptchaScript();
    addCaptchaEventListeners();
  } catch (error) {
    removeCaptchaEventListeners();
    handleCaptchaError();
  }
});

onBeforeUnmount(() => {
  removeCaptchaEventListeners();
});

// Exposed so unit tests can drive the widget's event handlers directly.
defineExpose({
  handleCaptchaCallback,
  handleCaptchaExpired,
  handleCaptchaError,
  handleCaptchaStateChange,
  divClass,
});
</script>
