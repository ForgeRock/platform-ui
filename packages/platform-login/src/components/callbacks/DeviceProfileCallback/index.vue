<!-- Copyright 2020 ForgeRock AS. All Rights Reserved

Use of this code requires a commercial software license with ForgeRock AS.
or with one of its affiliates. All use shall be exclusively subject
to such license between the licensee and ForgeRock AS. -->
<template>
  <div
    class="row justify-content-center">
    <FrSpinner
      label="Spinning"
      class="mb-4" />
    <div class="text-center text-muted w-100">
      {{ message }}
    </div>
  </div>
</template>

<script>
import Spinner from '@forgerock/platform-shared/src/components/Spinner/';
import { FRDevice } from '@forgerock/javascript-sdk';

export default {
  components: {
    FrSpinner: Spinner,
  },
  props: {
    callback: {
      type: Object,
      required: true,
    },
    nextStep: {
      type: Function,
      required: true,
    },
  },
  mounted() {
    this.message = this.callback.getMessage();
    this.deviceProfileCallback();
  },
  data() {
    return {
      message: '',
    };
  },
  methods: {
    deviceProfileCallback() {
      const device = new FRDevice();
      device.getProfile({
        location: this.callback.isLocationRequired(),
        metadata: this.callback.isMetadataRequired(),
      }).then((profile) => {
        this.callback.setProfile(profile);
        this.nextStep();
      }).catch(() => {
        this.callback.setProfile({});
        this.nextStep();
      });
    },
  },
};
</script>
