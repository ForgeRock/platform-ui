/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

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
 * @param {Object} params - parameters to filter the list
 * @returns {Promise} User information
 */
export function getUserGrants(userId = '', params = {}) {
  const queryString = encodeQueryString(params, false);
  return generateIgaApi().get(`/governance/user/${userId}/grants${queryString}`);
}

/**
 * get schema of the glossary attributes for application, role, entitlement
 * @returns {Promise} Glossary schema for application, role, entitlement
 */
export function getGlossarySchema() {
  return generateIgaApi().get('commons/glossary/schemaConfig');
}

/**
 * It returns the filter schema for the certification.
 * @returns The schema for the filter form.
 */
export function getFilterSchema() {
  return generateIgaApi().post('/governance/certification/get-filter-schema', {});
}
