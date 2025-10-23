/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';

const ANONYMOUS_HEADERS = {
  'X-OpenIDM-NoSession': true,
  'X-OpenIDM-Username': 'anonymous',
  'X-OpenIDM-Password': 'anonymous',
};

/**
 * Get the access token from the IDM API used to restore the user session
 * @returns {Promise} The response from the API
 */
export function getAccessToken() {
  return generateIdmApi({
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-cache',
      'x-requested-with': 'XMLHttpRequest',
    },
    timeout: 5000,
  }).post('/authentication?_action=login');
}

/**
 * Login to the IDM API
 * @param {string} username The username to login with
 * @param {string} password The password to login with
 * @param {boolean} [noSession=false] Whether to create a session or not
 * @returns {Promise} The response from the API
 */
export function login(username, password, noSession = false) {
  return generateIdmApi({
    headers: {
      'X-OpenIDM-NoSession': noSession,
      'X-OpenIDM-Username': username,
      'X-OpenIDM-Password': password,
    },
  }).post('/authentication?_action=login');
}

/**
 * Logs in a user using a JWT (JSON Web Token).
 * Sends a POST request to the authentication endpoint with the provided JWT in the headers.
 * @param {string} jwt - The JSON Web Token to use for authentication.
 * @returns {Promise} A promise that resolves with the response from the authentication API.
 */
export function loginWithJwt(jwt) {
  return generateIdmApi({
    headers: {
      'X-OpenIDM-Jwt': jwt,
      'X-OpenIDM-NoSession': false,
      'X-OpenIDM-Password': null,
      'X-OpenIDM-Username': null,
      'X-Requested-With': 'XMLHttpRequest',
    },
  }).post('/authentication?_action=login');
}

/**
 * Logs in a user using a provided Data Store token.
 *
 * Sends a POST request to the authentication endpoint with custom headers,
 * including the Data Store token for authentication.
 *
 * @param {string} dataStoreToken - The Data Store token used for authentication.
 * @returns {Promise} A promise that resolves with the response of the login request.
 */
export function loginWithDataStoreToken(dataStoreToken) {
  return generateIdmApi({
    headers: {
      'X-OpenIDM-NoSession': false,
      'X-OpenIDM-OAuth-Login': 'true',
      'X-OpenIDM-DataStoreToken': dataStoreToken,
      'X-Requested-With': 'XMLHttpRequest',
    },
  }).post('/authentication?_action=login');
}

/**
 * Logout from the IDM API
 * @returns {Promise} The response from the API
 */
export function logout() {
  return generateIdmApi({
    headers: {
      ...ANONYMOUS_HEADERS,
      'cache-control': 'no-cache',
    },
  }).post('/authentication?_action=logout');
}

/**
 * Get the profile from the IDM API
 * @param {string} resourcePath The resource path to get the managed used
 * @param {string} id The id of the managed user object
 * @returns {Promise} The response from the API
 */
export function getProfile(resourcePath, id) {
  return generateIdmApi().get(`/${resourcePath}/${id}`);
}

/**
 * Retrieves the authentication configuration from the IDM API.
 *
 * Sends a GET request to the '/authentication' endpoint with headers
 * for anonymous access (no session, anonymous username and password).
 *
 * @returns {Promise<AxiosResponse>} A promise that resolves to the authentication configuration response.
 */
export function getAuthenticationConfig() {
  return generateIdmApi({
    headers: ANONYMOUS_HEADERS,
  }).get('/authentication');
}

/**
 * Requests an authentication redirect URL from the identity provider.
 *
 * @param {Object} payload - The request payload containing authentication parameters.
 * @returns {Promise<Object>} A promise that resolves to the response from the identity provider.
 */
export function getAuthRedirect(payload) {
  return generateIdmApi({
    headers: ANONYMOUS_HEADERS,
  }).post('/identityProviders?_action=getAuthRedirect', payload);
}

/**
 * Sends a POST request to handle post-authentication with the provided payload and data store token.
 *
 * @param {string} dataStoreToken - The token used for authenticating with the data store.
 * @param {Object} payload - The payload to be sent in the POST request.
 * @returns {Promise} A promise that resolves with the response from the API.
 */
export function handlePostAuth(dataStoreToken, payload) {
  return generateIdmApi({
    headers: {
      ...ANONYMOUS_HEADERS,
      'X-OpenIDM-DataStoreToken': dataStoreToken,
    },
  }).post('/identityProviders?_action=handlePostAuth', payload);
}
