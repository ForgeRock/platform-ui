/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { ref } from 'vue';
import { has, last } from 'lodash';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { useRouter } from 'vue-router';
import { loadData, advanceStage } from '@/api/SelfServiceApi';

/**
 * @description Composable for handling self-service processes. It manages the progression through self-service stages and interacts with the API.
 */
function useSelfService() {
  const selfServiceDetails = ref(null);
  const showSelfService = ref(true);
  const errorFunction = ref(null);
  const router = useRouter();

  /**
   * Load the initial requirements for the self-service process.
   * @param {string} apiType - The type of self-service process (e.g., 'registration', 'username').
   * @param {Function} setChildComponent - Callback to set the child component based on the response.
   * @param {Object} router - Vue Router instance for navigation.
   */
  async function loadSelfServiceData(apiType) {
    try {
      const { data } = await loadData(apiType);
      selfServiceDetails.value = data;
    } catch (error) {
      if (has(router.currentRoute, 'params.profileProcess')) {
        router.push('/login');
      } else {
        showErrorMessage(error, '');
      }
    }
  }

  /**
   * Parses a query string into an object.
   * If the query string contains 'returnParams', extracts and returns its value.
   * Otherwise, converts the query string into a key-value object.
   * example =>
   *   queryParams = '&token=MY_TOKEN&code=MY_CODE'
   *   returns {
   *       token: 'MY_TOKEN',
   *       code: 'MY_CODE'
   *   }
   * @param {string} queryParams - The query string to parse (e.g., "?key1=value1&key2=value2").
   * @returns {Object} An object representing the parsed query parameters.
   */
  function parseQueryParams(queryParams) {
    if (!queryParams.match('returnParams')) {
      return JSON.parse(
        `{
          ${`${decodeURI(`"${queryParams.slice(1).replace(/&/g, '","').replace(/=/g, '":"')}`)}"`}
        }`,
      );
    }
    return { returnParams: last(decodeURIComponent(queryParams).split('returnParams=')) };
  }

  /**
   * Advance the stage of the self-service process.
   * @param {Object} data - The data to submit for the self-service process.
   * @param {boolean} noSessionFalse - Whether to use non-anonymous headers.
   * @param {Function} setChildComponent - Callback to set the child component based on the response.
   */
  async function advanceSelfServiceStage(apiType, data, noSessionFalse) {
    const saveData = {
      input: data,
    };

    if (data.token && data.code) {
      saveData.token = data.token;
    } else if (selfServiceDetails.value?.token) {
      saveData.token = selfServiceDetails.value.token;
    }

    if (showSelfService.value) {
      showSelfService.value = false;
    }

    try {
      const { data: advanceStageData } = await advanceStage(saveData, apiType, !noSessionFalse);
      selfServiceDetails.value = advanceStageData;
    } catch (error) {
      if (errorFunction.value) {
        errorFunction.value(error);
      } else {
        selfServiceDetails.value = { apiType, error: error.response?.data?.message || '' };
        showErrorMessage(error, '');
      }
    }
  }

  return {
    selfServiceDetails,
    showSelfService,
    errorFunction,
    loadSelfServiceData,
    advanceSelfServiceStage,
    parseQueryParams,
  };
}

export default useSelfService;
