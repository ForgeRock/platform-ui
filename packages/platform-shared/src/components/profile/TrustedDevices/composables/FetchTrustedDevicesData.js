/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { loadUserTrustedDevices } from '@forgerock/platform-shared/src/api/TrustedDevicesApi';
import { formatDevices } from '../utils/format';

/**
 * @description Composable for fetching Trusted Devices
 *
 * @returns {object} state The composable state
 * @property {AxiosError} state.error Error response from Axios
 * @property {function(): void} state.fetchData Function to call to fetch Trusted Devices
 * @property {boolean} state.isLoading Status of the loading process
 */
export default function useFetchTrustedDevices() {
  const isLoading = ref(false);
  const error = ref();

  /**
    * Loads the user's Trusted Device data
    * @param {string} realm - Realm used for the request
    * @param {string} userId - User id used for the request
    *
    * @returns {Promise<array>} Trusted device data formatted for the UI
  */
  const fetchData = async (realm, userId) => {
    try {
      isLoading.value = true;
      const response = await loadUserTrustedDevices(realm, userId);
      const formattedDevices = formatDevices(response.data.result);
      return formattedDevices;
    } catch (e) {
      error.value = e;
    } finally {
      isLoading.value = false;
    }
    return [];
  };
  return {
    error,
    fetchData,
    isLoading,
  };
}
