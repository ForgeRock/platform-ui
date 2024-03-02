<!-- Copyright (c) 2024 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <BModal
    id="device-modal"
    size="lg"
    :static="isTesting"
  >
    <template #modal-header>
      <div class="media align-items-center">
        <div
          v-if="props.device.deviceType"
          data-testid="device-icon"
          class="device device-xs mr-4"
          :data-device-type="props.device.deviceType" />
        <div class="media-body">
          <small>
            {{ $t('pages.profile.trustedDevices.deviceDetails') }}
          </small>
          <h2 class="font-weight-bold modal-title">
            {{ props.device.alias }}
          </h2>
        </div>
      </div>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="bvModal.hide('device-modal')">
        <FrIcon
          name="close"
          icon-class="text-muted md-24" />
      </BButtonClose>
    </template>
    <FrDeviceDetails
      :device="props.device"
      :shows-in-modal="true" />
    <template #modal-footer>
      <div class="w-100 d-flex justify-content-between">
        <BButton
          data-testid="remove-device"
          variant="outline-danger"
          @click="handleDeleteButtonClick">
          <FrIcon
            icon-class="mr-2"
            name="delete">
            {{ $t('pages.profile.trustedDevices.remove') }}
          </FrIcon>
        </BButton>
        <BButton
          variant="outline-primary"
          @click="bvModal.hide('device-modal')">
          {{ $t('common.done') }}
        </BButton>
      </div>
    </template>
  </BModal>
</template>
<script setup>

import {
  BButton,
  BButtonClose,
  BModal,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon/';
import FrDeviceDetails from '@forgerock/platform-shared/src/components/profile/TrustedDevices/DeviceDetails';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';

/**
* @description Modal to show a trusted device's details (os, browser, cpu, location, map), with an option to delete the device
*/

const { bvModal } = useBvModal();

const props = defineProps({
  device: {
    type: Object,
    default: () => {},
  },
  username: {
    type: String,
    default: '',
  },
  isTesting: {
    type: Boolean,
    default: false,
  },
});

/**
 * Triggers when remove button is clicked
 */
const emit = defineEmits(['delete-device']);

/**
 * Tells consuming component to delete the device using the device id
 */
function handleDeleteButtonClick() {
  emit('delete-device', props.device.deviceId);
}
</script>
