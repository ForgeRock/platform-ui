<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

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
import {
  CallbackType, FRStep, WebAuthnStepType, FRWebAuthn,
} from '@forgerock/javascript-sdk';
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
      type: [FRStep, Object],
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
    };
  },
  computed: {
    isWebAuthnSupported() {
      return FRWebAuthn.isWebAuthnSupported();
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
      const matches = this.step.getCallbacksOfType(CallbackType.MetadataCallback)
        .map((mc) => mc.getOutputValue('data'))
        .filter((data) => data?._action === 'webauthn_authentication');

      // We expect no more than one matching callback
      return matches[0] || null;
    },
  },
  methods: {
    invokeWebAuthn() {
      this.webAuthnPromiseFunction()
        .then(() => {
          this.$emit('next-step');
        }).catch(() => {
          if (this.isMediationConditional) {
            // Fail silently when using conditional mediation; other authentication mechanisms will be available.
            return;
          }
          const hasRecoveryCodeOption = !!this.step.getCallbacksOfType(CallbackType.ConfirmationCallback).length;
          if (hasRecoveryCodeOption) {
            this.webAuthnCanceled = true;
          } else {
            this.$emit('next-step');
          }
        });
    },
    invokeWebAuthnManual() {
      this.isManualWebAuthnInProgress = true;
      const optionsTransformer = (options) => ({ ...options, mediation: 'required' });

      this.webAuthnPromiseFunction(optionsTransformer)
        .then(() => {
          this.$emit('next-step');
        }).catch(() => {
          this.isManualWebAuthnInProgress = false;
          if (this.isMediationConditional) {
            this.invokeWebAuthn();
          }
        });
    },
  },
  mounted() {
    this.invokeWebAuthn();
  },
};
</script>
