/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const roleUrl = 'governance/role';

/**
 * Get a list of roles.
 *
 * @param {Object} queryParams - The query parameters to include in the request.
 * @returns {Promise} - A promise that resolves to a list of roles.
 */
export async function getRoleList(resource, queryParams = {}) {
  try {
    const encodedQueryParams = encodeQueryString(queryParams, false);
    return generateIgaApi().get(`${roleUrl}${encodedQueryParams}`);
  } catch (error) {
    return error;
  }
}

/**
 * Get role details for a single role by ID.
 *
 * @param {string} id - The ID of the role to retrieve.
 * @param {string} status - The status of the role.
 * @param {string} dataType - Specific role data to retrieve, such as role members.
 * @param {Object} queryParams - The query parameters to include in the request.
 * @param {string} requestId - The ID of the request.
 * @returns {Promise} A promise that resolves to the role details.
 */
export function getRoleDataById(id, status, dataType, queryParams = {}, requestId) {
  let url = roleUrl;
  if (requestId?.length) {
    queryParams.requestId = requestId;
  }
  let encodedQueryParams = encodeQueryString(queryParams, false);
  if (!id) {
    url += `/${dataType}`;
    encodedQueryParams = encodeQueryString({ requestId }, false);
  } else {
    url += `/${id}/${status}`;
    if (dataType) {
      url += `/${dataType}`;
    }
  }
  return generateIgaApi().get(`${url}${encodedQueryParams}`);
}

/**
 * Delete a single role by ID.
 *
 * @param {string} id - The ID of the role to delete.
 * @param {string} status - The status of the role.
 * @returns {Promise} A promise that resolves to the role details.
 */
export function deleteRole(id, status) {
  const url = `${roleUrl}/${id}/${status}`;
  return generateIgaApi().delete(url);
}

/**
 * Get member attribute distribution for a single role by ID.
 *
 * @param {string} id - The ID of the role to retrieve.
 * @param {string} status - The status of the role.
 * @returns {Promise} A promise that resolves to the member distribution details.
 */
export function getMemberDistribution(id, status) {
  const url = `${roleUrl}/${id}/${status}/members/distribution`;
  return generateIgaApi().get(url);
}
/**
 * Create a new role.
 *
 * @param {Object} payload - The request payload containing role details.
 * @returns {Promise} A promise that resolves to the role details.
 */
export function createRole(payload) {
  const url = `${roleUrl}`;
  return generateIgaApi().post(url, payload);
}
/**
 * Modify an existing role.
 *
 * @param {string} id - The ID of the role to modify.
 * @param {string} status - The status of the role.
 * @param {Object} payload - The request payload containing role details.
 * @returns {Promise} A promise that resolves to the role details.
 */
export function modifyRole(id, status, payload) {
  const url = `${roleUrl}/${id}/${status}`;
  return generateIgaApi().put(url, payload);
}
/**
 * Publish a role.
 *
 * @param {string} id - The ID of the role.
 * @param {string} status - The status of the role.
 * @param {Object} payload - The request payload containing role details.
 * @returns {Promise} A promise that resolves to the role details.
 */
export function publishRole(id, status, payload) {
  const url = `${roleUrl}/${id}/${status}`;
  return generateIgaApi().patch(url, payload);
}
