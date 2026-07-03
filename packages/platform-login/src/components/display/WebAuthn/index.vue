<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <template
    v-if="!isMediationConditional">
    <FrSpinner
      v-show="!webAuthnCanceled"
      class="mb-4"
      label="Spinning" />
    <h5>{{ header }}</h5>
    <p>{{ info }}</p>
  </template>
  <template v-else-if="isManualButtonEnabled">
    <!--  'Sign in with a passkey' button  -->
    <FrHorizontalRule
      v-if="hasDivider"
      class="my-3"
      :insert="$t('login.social.or')" />
    <FrButtonWithSpinner
      :button-text="$t('login.webAuthn.usePasskey')"
      :show-spinner="isManualWebAuthnInProgress"
      :spinner-text="$t('login.webAuthn.usePasskey')"
      :disabled="!isWebAuthnSupported || isManualWebAuthnInProgress"
      @click.prevent="invokeWebAuthnManual" />
  </template>
</template>

<script>
import { callbackType } from '@forgerock/journey-client';
import { WebAuthn, WebAuthnStepType } from '@forgerock/journey-client/webauthn';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';
import FrButtonWithSpinner from '@forgerock/platform-shared/src/components/ButtonWithSpinner/';
import FrHorizontalRule from '@forgerock/platform-shared/src/components/HorizontalRule/HorizontalRule';

export default {
  name: 'WebAuthnComponent',
  components: {
    FrHorizontalRule,
    FrButtonWithSpinner,
    FrSpinner,
  },
  props: {
    step: {
      type: Object,
      required: true,
    },
    webAuthnPromiseFunction: {
      type: Function,
      required: true,
    },
    webAuthnType: {
      type: Number,
      required: true,
    },
    hasDivider: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      webAuthnCanceled: false,
      isManualWebAuthnInProgress: false,
      conditionalAbortController: null,
      conditionalPromise: null,
      webAuthnInProgress: false,
      onUserInteraction: null,
    };
  },
  computed: {
    isWebAuthnSupported() {
      return !!window.PublicKeyCredential;
    },
    isMediationConditional() {
      return this.webAuthnData?.mediation === 'conditional';
    },
    isManualButtonEnabled() {
      return !!this.webAuthnData?.manualButtonEnabled;
    },
    header() {
      if (!this.webAuthnCanceled) {
        return this.webAuthnType === WebAuthnStepType.Authentication ? this.$t('login.webAuthn.authenticate') : this.$t('login.webAuthn.register');
      }
      return this.$t('login.webAuthn.failed');
    },
    info() {
      if (!this.webAuthnCanceled) {
        return this.webAuthnType === WebAuthnStepType.Authentication ? this.$t('login.webAuthn.authenticateInfo') : this.$t('login.webAuthn.registerInfo');
      }
      return this.$t('login.webAuthn.failedInfo');
    },
    webAuthnData() {
      const matches = this.step.getCallbacksOfType(callbackType.MetadataCallback)
        .map((mc) => mc.getOutputValue('data'))
        .filter((data) => data?._action === 'webauthn_authentication');

      // We expect no more than one matching callback
      return matches[0] || null;
    },
  },
  methods: {
    handleWebAuthnError() {
      if (this.isMediationConditional) {
        return;
      }
      const hasRecoveryCodeOption = !!this.step.getCallbacksOfType(callbackType.ConfirmationCallback).length;
      if (hasRecoveryCodeOption) {
        this.webAuthnCanceled = true;
      } else {
        this.$emit('next-step');
      }
    },
    invokeWebAuthn(signal) {
      this.webAuthnInProgress = true;

      const promise = this.webAuthnPromiseFunction(signal);
      if (this.isMediationConditional) {
        // Retain the in-flight conditional promise so invokeWebAuthnManual can
        // await its settlement after aborting — the browser only allows one
        // navigator.credentials.get() at a time, and starting the manual call
        // before the aborted conditional call has rejected throws InvalidStateError.
        this.conditionalPromise = promise;
      }
      promise
        .then(() => {
          this.webAuthnInProgress = false;
          this.removeInteractionListener();
          this.$emit('next-step');
        }).catch(() => {
          this.webAuthnInProgress = false;
          this.removeInteractionListener();
          this.handleWebAuthnError();
        });
    },
    removeInteractionListener() {
      if (this.onUserInteraction) {
        window.removeEventListener('pointerdown', this.onUserInteraction, { capture: true });
        window.removeEventListener('keydown', this.onUserInteraction, { capture: true });
        this.onUserInteraction = null;
      }
    },
    async invokeWebAuthnManual() {
      this.isManualWebAuthnInProgress = true;

      // Abort the background conditional listener so the browser can accept a new credentials.get call.
      if (this.conditionalAbortController) {
        this.conditionalAbortController.abort();
        this.conditionalAbortController = null;
      }
      // Wait for the aborted conditional promise to actually settle before starting a
      // new credentials.get() — the browser rejects overlapping calls with InvalidStateError.
      if (this.conditionalPromise) {
        const inFlight = this.conditionalPromise;
        this.conditionalPromise = null;
        await inFlight.catch(() => {});
      }

      try {
        const metaCallback = WebAuthn.getMetadataCallback(this.step);
        const metadata = metaCallback?.getOutputValue('data');
        const publicKey = WebAuthn.createAuthenticationPublicKey(metadata);
        const credential = await WebAuthn.getAuthenticationCredential(publicKey, 'required');
        const outcomeCallback = WebAuthn.getOutcomeCallback(this.step);
        if (outcomeCallback) {
          // Replicate WebAuthn.authenticate's supportsJsonResponse branch so AM accepts the outcome.
          if (metadata?.supportsJsonResponse && credential && 'authenticatorAttachment' in credential) {
            const legacyData = WebAuthn.getAuthenticationOutcome(credential);
            outcomeCallback.setInputValue(JSON.stringify({
              authenticatorAttachment: credential.authenticatorAttachment,
              legacyData,
            }));
          } else {
            outcomeCallback.setInputValue(WebAuthn.getAuthenticationOutcome(credential));
          }
        }
        this.$emit('next-step');
      } catch (err) {
        this.isManualWebAuthnInProgress = false;
        if (this.isMediationConditional) {
          // Restart the background conditional listener after the manual attempt failed/was cancelled.
          this.conditionalAbortController = new AbortController();
          this.invokeWebAuthn(this.conditionalAbortController.signal);
        }
      }
    },
  },
  mounted() {
    if (this.isMediationConditional) {
      this.conditionalAbortController = new AbortController();
      this.invokeWebAuthn(this.conditionalAbortController.signal);
    } else {
      this.invokeWebAuthn();
    }
  },
  unmounted() {
    this.removeInteractionListener();

    if (this.conditionalAbortController) {
      this.conditionalAbortController.abort();
      this.conditionalAbortController = null;
    }
  },
};
</script>
