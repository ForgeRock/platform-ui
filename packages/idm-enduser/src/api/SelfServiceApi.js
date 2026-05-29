/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import { extend } from 'lodash';

/**
 * Request headers for anonymous access to the IDM API.
 */
const ANONYMOUS_HEADERS = {
  'X-OpenIDM-NoSession': true,
  'X-OpenIDM-Password': 'anonymous',
  'X-OpenIDM-Username': 'anonymous',
  'cache-control': 'no-cache',
};

/**
 * Load the data for self service api based on type
 * @returns {Promise} The response from the API
 */
export function loadData(apiType) {
  const selfServiceInstance = generateIdmApi({
    headers: ANONYMOUS_HEADERS,
  }, false);
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
    headers = ANONYMOUS_HEADERS;
  }
  const selfServiceInstance = generateIdmApi({
    headers: extend(headers, { 'X-Requested-With': 'XMLHttpRequest' }),
  }, false);
  return selfServiceInstance.post(`/selfservice/${apiType}?_action=submitRequirements`, data);
}

/**
 * Retrieves the list of identity providers from the self-service API.
 * @returns {Promise<Object>} A promise that resolves to the response containing identity providers.
 */
export function getIdentityProviders() {
  const selfServiceInstance = generateIdmApi({
    headers: ANONYMOUS_HEADERS,
  }, false);
  return selfServiceInstance.get('/identityProviders');
}

/**
 * Unbinds a social provider from a user account.
 * @param {string} resource - The API resource endpoint.
 * @param {string|number} userId - The ID of the user to unbind the provider from.
 * @param {string} provider - The name of the social provider to unbind.
 * @returns {Promise} A promise that resolves with the API response.
 */
export function unbindSocialProvider(resource, userId, provider) {
  const selfServiceInstance = generateIdmApi({
    headers: ANONYMOUS_HEADERS,
  }, false);
  return selfServiceInstance.post(`${resource}/${userId}?_action=unbind&provider=${provider}`);
}

/**
 * Binds a social provider to a user account via the self-service API.
 * @param {string} resource - The API resource endpoint.
 * @param {string|number} userId - The unique identifier of the user.
 * @param {string} provider - The social provider to bind (e.g., 'google', 'facebook').
 * @param {Object} clientToken - The client token object containing authentication details.
 * @returns {Promise<Object>} A promise that resolves with the API response.
 */
export function bindSocialProvider(resource, userId, provider, clientToken) {
  const selfServiceInstance = generateIdmApi({
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });
  return selfServiceInstance.post(`${resource}/${userId}?_action=bind&provider=${provider}`, JSON.stringify(clientToken));
}

/**
 * Retrieves the list of connected identity providers (IDPs) for a given resource and user.
 * @param {string} resource - The API resource path.
 * @param {string|number} userId - The unique identifier of the user.
 * @returns {Promise<Object>} A promise that resolves to the response containing connected IDPs.
 */
export function getConnectedProviders(resource, userId) {
  const selfServiceInstance = generateIdmApi({
    headers: ANONYMOUS_HEADERS,
  }, false);
  return selfServiceInstance.get(`${resource}/${userId}?_fields=idps/*`);
}

/**
 * Retrieves and normalizes a social provider profile using the provided payload.
 * @param {Object} profileRequestPayload - The payload containing profile information to be normalized.
 * @returns {Promise<Object>} A promise that resolves to the normalized profile data.
 */
export function getSocialProviderProfile(profileRequestPayload) {
  const selfServiceInstance = generateIdmApi();
  return selfServiceInstance.post('identityProviders?_action=normalizeProfile', profileRequestPayload);
}
