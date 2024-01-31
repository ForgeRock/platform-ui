/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { updateTrustedDevice } from '@forgerock/platform-shared/src/api/TrustedDevicesApi';

/**
 * @description Composable for deleting Trusted Devices
 *
 * @returns {object} state The composable state
 * @property {AxiosError} state.error Error response from Axios
 * @property {function(): void} state.editData Function to call to edit a Trusted Device
 * @property {boolean} state.isSaving Status of the deletion process
 */
export default function useEditTrustedDevice() {
  const isSaving = ref(false);
  const error = ref();

  /**
    * Edits the user's Trusted Device data
    * @param {string} realm - Realm used for the request
    * @param {string} deviceId - Device id used for the request
    * @param {object} payload - Device id used for the request
    * @param {string} userId - User id used for the request
  */
  const editData = async (realm, userId, payload, deviceId) => {
    try {
      isSaving.value = true;
      await updateTrustedDevice(realm, userId, payload, deviceId);
    } catch (e) {
      error.value = e;
    } finally {
      isSaving.value = false;
    }
  };
  return {
    error,
    editData,
    isSaving,
  };
}
