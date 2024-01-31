/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { deleteTrustedDevice } from '@forgerock/platform-shared/src/api/TrustedDevicesApi';

/**
 * @description Composable for deleting Trusted Devices
 *
 * @returns {object} state The composable state
 * @property {AxiosError} state.error Error response from Axios
 * @property {function(): void} state.deleteData Function to call to delete a Trusted Device
 * @property {boolean} state.isDeleting Status of the deletion process
 */
export default function useDeleteTrustedDevice() {
  const isDeleting = ref(false);
  const error = ref();

  /**
    * Deletes a user's trusted device by id
    * @param {string} realm - Realm used for the request
    * @param {string} userId - User id used for the request
    * @param {string} deviceId - Device id used for the request
  */
  const deleteData = async (realm, userId, deviceId) => {
    try {
      isDeleting.value = true;
      await deleteTrustedDevice(realm, userId, deviceId);
    } catch (e) {
      error.value = e;
    } finally {
      isDeleting.value = false;
    }
  };
  return {
    error,
    deleteData,
    isDeleting,
  };
}
