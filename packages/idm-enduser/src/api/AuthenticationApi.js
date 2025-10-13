/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';

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
 * @returns {Promise} The response from the API
 */
export function login(username, password) {
  return generateIdmApi({
    headers: {
      'X-OpenIDM-NoSession': false,
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
 * Logout from the IDM API
 * @returns {Promise} The response from the API
 */
export function logout() {
  return generateIdmApi({
    headers: {
      'X-OpenIDM-NoSession': true,
      'X-OpenIDM-Username': 'anonymous',
      'X-OpenIDM-Password': 'anonymous',
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
