/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable import/prefer-default-export */
import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import { extend } from 'lodash';

/**
 * Request headers for anonymous access to the IDM API.
 */
const ANONYMUS_HEADERS = {
  'X-OpenIDM-NoSession': true,
  'X-OpenIDM-Password': 'anonymous',
  'X-OpenIDM-Username': 'anonymous',
  'cache-control': 'no-cache',
};

/**
 * Load the datta for self service api based on type
 * @returns {Promise} The response from the API
 */
export function loadData(apiType) {
  const selfServiceInstance = generateIdmApi({
    headers: ANONYMUS_HEADERS,
  });
  return selfServiceInstance.get(`/selfservice/${apiType}`);
}

/**
 * Advance the stage of a self-service process.
 * @param {Object} data The data to submit for the self-service process
 * @param {boolean} [anonymous=true] Whether to use anonymous headers or not
 * @returns {Promise} The response from the API
 */
export function advanceStage(data, apiType, anonymous = true) {
  let headers;
  if (!anonymous) {
    headers = {
      'X-OpenIDM-NoSession': false,
      'X-OpenIDM-Password': null,
      'X-OpenIDM-Username': null,
    };
  } else {
    headers = ANONYMUS_HEADERS;
  }
  const selfServiceInstance = generateIdmApi({
    headers: extend(headers, { 'X-Requested-With': 'XMLHttpRequest' }),
  });
  return selfServiceInstance.post(`/selfservice/${apiType}?_action=submitRequirements`, data);
}
