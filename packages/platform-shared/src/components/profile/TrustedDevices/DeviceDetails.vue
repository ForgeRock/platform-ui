<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BRow>
    <BCol
      v-if="device.map"
      data-testid="device-map"
      md="5"
    >
      <div class="w-100">
        <div class="mb-2">
          <h5 class="small">
            {{ $t('pages.profile.trustedDevices.recentActivity') }}
          </h5>
        </div>
        <img
          class="mb-3 w-100"
          :src="device.map">
        <div class="media">
          <FrIcon
            class="mr-2 mt-1 text-muted"
            name="place" />
          <div class="media-body">
            <div class="bold">
              {{ device.formattedAddress }}
            </div>
            <p class="text-muted">
              {{ device.lastLogin }}
            </p>
          </div>
        </div>
      </div>
    </BCol>
    <BCol>
      <div>
        <div
          v-if="device.os"
          data-testid="device-os"
          class="mb-3"
        >
          <h5 class="small">
            {{ $t('pages.profile.trustedDevices.os') }}
          </h5>
          <p class="bold">
            {{ device.os }}
          </p>
        </div>
        <div
          v-if="device.browser"
          data-testid="device-browser"
          class="mb-3"
        >
          <h5 class="small">
            {{ $t('pages.profile.trustedDevices.browser') }}
          </h5>
          <p class="bold">
            {{ device.browser }}
          </p>
        </div>
        <div
          v-if="device.cpu"
          data-testid="device-cpu"
        >
          <h5 class="small">
            {{ $t('pages.profile.trustedDevices.cpu') }}
          </h5>
          <p class="bold">
            {{ device.cpu }}
          </p>
        </div>
      </div>
    </BCol>
  </BRow>
  <div
    v-if="!device.isCurrent && !showsInModal"
    class="d-flex justify-content-start"
    data-testid="device-remove"
  >
    <BButton
      data-testid="remove-button"
      variant="outline-danger"
      class="w-100"
      v-b-modal.trusted-devices-modal
      @click="$emit('remove-device', device)">
      <FrIcon
        class="mr-2"
        name="block" />
      {{ $t('pages.profile.trustedDevices.remove') }}
    </BButton>
  </div>
</template>
<script setup>
/**
 * @typedef {Object} Device - Object that contains the device details
 * @property {String} alias
 * @property {String} browser
 * @property {String} cpu
 * @property {String} deviceId
 * @property {Boolean} isCurrent
 * @property {String} lastLogin
 * @property {Number} lastSelectedDate
 * @property {String} os
 * @property {String} deviceType
 * @property {String} formattedAddress
 * @property {String} locality
 * @property {String} map
 */

import {
  BButton,
  BCol,
  BRow,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';

// Props
defineProps({
  device: {
    /** @type {Device} */
    type: Object,
    default: () => {},
  },
  showsInModal: {
    /** @type {Boolean} */
    type: Boolean,
    default: false,
  },
});

// Emits
/**
 * Triggers when Remove Button is clicked
 * @arg {Device} device Object containing the details of the device to be removed
 */
defineEmits(['remove-device']);
</script>
