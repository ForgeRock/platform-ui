<!-- Copyright (c) 2020-2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <FrSpinner
      v-show="!webAuthnCanceled"
      class="mb-4"
      label="Spinning" />
    <h5>{{ header }}</h5>
    <p>{{ info }}</p>
  </div>
</template>

<script>
import { CallbackType, FRStep, WebAuthnStepType } from '@forgerock/javascript-sdk';
import FrSpinner from '@forgerock/platform-shared/src/components/Spinner/';

export default {
  name: 'WebAuthnComponent',
  components: {
    FrSpinner,
  },
  props: {
    step: {
      type: [FRStep, Object],
      required: true,
    },
    webAuthnPromise: {
      type: Promise,
      required: true,
    },
    webAuthnType: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      webAuthnCanceled: false,
    };
  },
  computed: {
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
  },
  mounted() {
    this.webAuthnPromise
      .then(() => {
        this.$emit('next-step');
      }).catch(() => {
        const hasRecoveryCodeOption = !!this.step.getCallbacksOfType(CallbackType.ConfirmationCallback).length;
        if (hasRecoveryCodeOption) {
          this.webAuthnCanceled = true;
        } else {
          this.$emit('next-step');
        }
      });
  },
};
</script>
