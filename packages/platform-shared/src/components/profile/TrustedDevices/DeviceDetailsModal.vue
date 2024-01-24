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
          v-if="device.deviceType"
          data-testid="device-icon"
          class="device device-xs mr-4"
          :data-device-type="device.deviceType" />
        <div class="media-body">
          <small>
            {{ $t('pages.profile.trustedDevices.deviceDetails') }}
          </small>
          <h5 class="modal-title">
            {{ device.alias }}
          </h5>
        </div>
      </div>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="bvModal.hide('device-modal')"
      >
        <FrIcon
          name="close"
          class="text-light text-muted md-24" />
      </BButtonClose>
    </template>
    <FrDeviceDetails
      :device="device"
      :shows-in-modal="true" />
    <template #modal-footer>
      <div
        class="w-100 d-flex"
        :class="device.isCurrent ? 'justify-content-end' : 'justify-content-between'"
      >
        <BButton
          v-if="!device.isCurrent"
          data-testid="remove-device"
          variant="outline-danger"
          @click="switchModal()"
        >
          <FrIcon
            class="material-icons-outlined mr-2"
            name="delete" />
          {{ $t('pages.profile.trustedDevices.remove') }}
        </BButton>
        <BButton
          variant="outline-primary"
          @click="bvModal.hide('device-modal')"
        >
          {{ $t('common.done') }}
        </BButton>
      </div>
    </template>
  </BModal>
  <BModal
    id="confirmation-modal"
    size="md"
    :static="isTesting"
  >
    <template #modal-header>
      <div class="media align-items-center">
        <div class="media-body">
          <h5 class="modal-title">
            {{ $t('pages.profile.trustedDevices.remove') }}
          </h5>
        </div>
      </div>
      <BButtonClose
        variant="link"
        class="ml-auto"
        @click="bvModal.hide('confirmation-modal')">
        <FrIcon
          name="close"
          class="text-light text-muted md-24" />
      </BButtonClose>
    </template>
    <p v-html="$t('pages.profile.trustedDevices.removeConfirmationMessage', {username: username})" />
    <template #modal-footer>
      <div class="w-100 d-flex justify-content-end">
        <BButton
          variant="link"
          class="text-danger"
          @click="bvModal.hide('confirmation-modal')"
        >
          {{ $t('common.cancel') }}
        </BButton>
        <BButton
          data-testid="confirmation-button"
          variant="danger"
          @click="$emit('remove-device', device)"
        >
          {{ $t('pages.profile.trustedDevices.remove') }}
        </BButton>
      </div>
    </template>
  </BModal>
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
  BButtonClose,
  BModal,
} from 'bootstrap-vue';
import FrIcon from '@forgerock/platform-shared/src/components/Icon';
import FrDeviceDetails from '@forgerock/platform-shared/src/components/profile/TrustedDevices/DeviceDetails';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';

// Composables
const { bvModal } = useBvModal();

// Props
defineProps({
  device: {
    /** @type {Device} */
    type: Object,
    default: () => {},
  },
  username: {
    /** @type {String} */
    type: String,
    default: '',
  },
  isTesting: {
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

/** Hides device modal to show remove confirmation modal when removing device */
function switchModal() {
  bvModal.value.show('confirmation-modal');
  bvModal.value.hide('device-modal');
}
</script>
