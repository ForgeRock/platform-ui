/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
