/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

/**
 * Retieves resource list from IGA backend using provided query parameters
 * @param {String} resource Type of resource to query
 * @param {Object} queryParams query parameters to search for resource list
 * @returns {Promise} IGA resources
 */
export function getResource(resource, queryParams = {}) {
  const baseResources = ['user', 'role', 'application', 'organization'];
  const adjustedResource = baseResources.includes(resource) ? `alpha_${resource}` : resource;

  queryParams.queryString = queryParams.queryString ?? '';
  const encodedQueryParams = encodeQueryString(queryParams, false);
  return generateIgaApi().get(`commons/search/${adjustedResource}${encodedQueryParams}`);
}

/**
 * Retieves config for approval requests including
 * {
 *  "requireRequestJustification": Boolean,
 *  "requireRejectJustification": Boolean,
 *  "requireApproveJustification": Boolean,
 *  "defaultApprover": String,
 *  "allowSelfApproval": Boolean
 * }
 * @returns {Promise} Contains IGA approval request config
 */
export function getIgaAccessRequest() {
  return generateIgaApi().get('commons/config/iga_access_request');
}

/**
 * Fetches the IGA UI configuration
 * @returns {Promise} A promise that resolves to the IGA UI configuration object.
 */
export async function getIgaUiConfig() {
  return generateIgaApi().get('commons/config/iga_ui_config');
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
  return generateIgaApi().post('/governance/certification/get-filter-schema');
}

/**
 * Get List of Glossary attributes based on filter payload and query parameters
 * @param {Object} payload request body payload to include in request
 * @param {Object} params Query parameters to pass to request
 *                 pageNumber - current page to request
 *                 pageSize - results in page
 *                 sortBy - field to sort results by
 *                 sortDir - (asc/desc) direction to sort results by
 * @returns The response is a promise that resolves to the data returned by the API.
 */
export function searchGovernanceResource(payload, params) {
  const queryParams = encodeQueryString(params, false);
  return generateIgaApi().post(`/governance/resource/search${queryParams}`, payload);
}
