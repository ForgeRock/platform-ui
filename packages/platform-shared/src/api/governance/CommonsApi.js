/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';

/**
 * @typedef {"role" | "account" | "entitlement" } grantType
 */

export function getResource(resource, queryString = '', pageSize = '') {
  return generateIgaApi().get(`commons/search/${resource}?queryString=${queryString}&pageSize=${pageSize}`);
}

/**
 * get user details by ID
 * @param {String} userId ID of selected User
 * @returns {Promise} User details
 */
export function getUserDetails(userId = '') {
  return generateIgaApi().get(`commons/search/user?queryString=${userId}`);
}

/**
 * get user information by grandType and ID
 * @param {String} userId ID of selected User
 * @param {grantType} grantType grant type to search for
 * @returns {Promise} User information
 */
export function getUserGrants(userId = '', grantType = '') {
  return generateIgaApi().get(`/governance/user/${userId}/grants?grantType=${grantType}`);
}
