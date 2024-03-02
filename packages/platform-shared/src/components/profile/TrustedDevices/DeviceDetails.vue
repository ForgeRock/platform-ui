<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BRow>
    <BCol
      v-if="device.map"
      data-testid="device-map"
      md="5">
      <div class="w-100">
        <div class="mb-2">
          <h3 class="small">
            {{ $t('pages.profile.trustedDevices.recentActivity') }}
          </h3>
        </div>
        <img
          :alt="$t('pages.profile.trustedDevices.googleMapsLocationImgAlt')"
          class="mb-3 w-100"
          :src="device.map">
        <div class="media">
          <FrIcon
            icon-class="mr-2 mt-1 text-muted"
            name="place" />
          <div class="media-body">
            <div
              data-testid="formatted-address"
              class="bold">
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
          class="mb-3">
          <h3 class="small">
            {{ $t('pages.profile.trustedDevices.os') }}
          </h3>
          <p class="bold">
            {{ device.os }}
          </p>
        </div>
        <div
          v-if="device.browser"
          data-testid="device-browser"
          class="mb-3">
          <h3 class="small">
            {{ $t('pages.profile.trustedDevices.browser') }}
          </h3>
          <p class="bold">
            {{ device.browser }}
          </p>
        </div>
        <div
          v-if="device.cpu"
          data-testid="device-cpu">
          <h3 class="small">
            {{ $t('pages.profile.trustedDevices.cpu') }}
          </h3>
          <p class="bold">
            {{ device.cpu }}
          </p>
        </div>
      </div>
    </BCol>
  </BRow>
</template>
<script setup>

import {
  BCol,
  BRow,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon/index';

/**
* @description Component to show the details (os, browser, cpu, location, map) of a trusted device
*/

defineProps({
  device: {
    type: Object,
    default: () => {},
  },
  showsInModal: {
    type: Boolean,
    default: false,
  },
});
</script>
