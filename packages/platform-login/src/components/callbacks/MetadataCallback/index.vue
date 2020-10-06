<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->
<template>
  <div />
</template>

<script>
import { FRWebAuthn } from '@forgerock/javascript-sdk';

export default {
  name: 'MetadataCallback',
  props: {
    step: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },
  mounted() {
    this.metadataCallback(this.step);
  },
  methods: {
    metadataCallback(step) {
      const webAuthnStepType = FRWebAuthn.getWebAuthnStepType(step);
      if (webAuthnStepType === 0) {
        // Not a webAuthn step
        this.$emit('next-step');
      } else if (webAuthnStepType === 1) {
        // Authenticate with a registered device
        this.$emit('hide-next-button', true);
        FRWebAuthn.authenticate(step).then(() => {
          this.$emit('next-step');
        });
      } else if (webAuthnStepType === 2) {
        // Register a new device
        this.$emit('hide-next-button', true);
        FRWebAuthn.register(step).then(() => {
          this.$emit('next-step');
        });
      }
    },
  },
};
</script>
