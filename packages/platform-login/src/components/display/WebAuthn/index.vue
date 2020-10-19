<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->
<template>
  <div>
    <FrSpinner
      class="mb-4"
      label="Spinning" />
    <h5>{{ header }}</h5>
    <p>{{ info }}</p>
  </div>
</template>

<script>
import {
  FRStep, FRWebAuthn, WebAuthnStepType, CallbackType,
} from '@forgerock/javascript-sdk';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';

export default {
  name: 'WebAuthnComponent',
  components: {
    FrSpinner,
  },
  props: {
    step: {
      type: FRStep,
      required: true,
    },
  },
  data() {
    return {
      header: '',
      info: '',
    };
  },
  mounted() {
    const type = FRWebAuthn.getWebAuthnStepType(this.step);
    if (type === WebAuthnStepType.Authentication) {
      this.header = this.$t('login.webAuthn.authenticate');
      this.info = this.$t('login.webAuthn.authenticateInfo');
      // Authenticate with a registered device - debounced so multiple textOutputCallbacks in one dont start the process multiple times
      FRWebAuthn.authenticate(this.step)
        .then(() => {
          this.$emit('next-step');
        }).catch(() => {
          // remove setting input value when SDK handles the error correctly
          const HiddenValueCallback = this.step.getCallbacksOfType(CallbackType.HiddenValueCallback);
          HiddenValueCallback[0].setInputValue('ERROR::NotAllowedError: The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client.');
          this.$emit('next-step');
        });
    } else if (type === WebAuthnStepType.Registration) {
      this.header = this.$t('login.webAuthn.register');
      this.info = this.$t('login.webAuthn.registerInfo');
      // Register a new device - debounced so multiple textOutputCallbacks in one dont start the process multiple times
      FRWebAuthn.register(this.step)
        .finally(() => {
          this.$emit('next-step');
        });
    }
  },
};
</script>
