<!-- Copyright (c) 2020-2026 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
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
import { Device } from '@forgerock/journey-client/device';

export default {
  name: 'DeviceProfileCallback',
  components: {
    FrSpinner: Spinner,
  },
  props: {
    callback: {
      type: Object,
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
      const device = new Device();
      device.getProfile({
        location: this.callback.isLocationRequired(),
        metadata: this.callback.isMetadataRequired(),
      }).then((profile) => {
        this.callback.setProfile(profile);
        this.$emit('next-step');
      }).catch(() => {
        this.callback.setProfile({});
        this.$emit('next-step');
      });
    },
  },
};
</script>
