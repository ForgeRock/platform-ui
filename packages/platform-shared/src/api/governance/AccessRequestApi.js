/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

/**
 * Gets all requests made by the user to display them in enduser
 * @param {String} userId id of the user making the query
 * @param {Object} params query parameters
 * @param {Object} filter filters applied to the query
 * @returns {Promise}
 */
export function getUserRequests(userId, params, filter) {
  params.action = 'search';
  const queryString = encodeQueryString(params, true);
  return generateIgaApi().post(`/governance/user/${userId}/requests${queryString}`, { targetFilter: filter });
}

/**
 * Gets all requests to display in admin
 * @param {Object} params query parameters
 * @param {Object} filter filters applied to the query
 * @returns {Promise}
 */
export function getRequests(params, filter) {
  params.action = 'search';
  const queryString = encodeQueryString(params, true);
  return generateIgaApi().post(`/governance/requests${queryString}`, { targetFilter: filter });
}

/**
 * Retrieves a specific access request by its ID.
 *
 * @param {string} requestId - The ID of the access request to retrieve.
 * @returns {Promise} A promise that resolves with the access request data.
 */
export function getRequest(requestId) {
  return generateIgaApi().get(`/governance/requests/${requestId}`);
}

/**
 * Retrieves the request type with the specified ID.
 *
 * @param {string} requestTypeId - The ID of the request type to retrieve.
 * @returns {Promise} A Promise that resolves to the request type object.
 */
export function getRequestType(requestTypeId) {
  return generateIgaApi().get(`/governance/requestTypes/${requestTypeId}`);
}

/**
 * Retrieves request types based on the provided parameters and search text.
 * @param {object} params - The parameters used to filter the request types.
 * @param {string} searchText - The search text used to filter the request types.
 * @returns {Promise} A promise that resolves to the response containing the request types.
 */
export function getRequestTypes(params, searchText) {
  const newParams = { ...params };
  if (searchText) {
    newParams.queryFilter = `id co "${searchText}" or displayName co "${searchText}"`;
  }
  const queryParams = encodeQueryString(newParams);
  return generateIgaApi().get(`/governance/requestTypes${queryParams}`);
}

/**
 * Retrieves the approvals for a specific user.
 *
 * @param {string} userId - The ID of the user.
 * @param {Object} params - The parameters for the request.
 * @param {string} filter - The target filter.
 * @returns {Promise} A promise that resolves with the user approvals.
 */
export function getUserApprovals(userId, params, filter) {
  params._action = 'search';
  params.type = 'request';
  const queryString = encodeQueryString(params, false);
  return generateIgaApi().post(`/governance/user/${userId}/tasks${queryString}`, { targetFilter: filter });
}

/**
 * Take action on a request
 * @param {String} requestId ID of request
 * @param {String} phaseName Phase name in which the request is
 * @param {String} action action being realized to the request
 * @param {Object} requestPayload request payload details
 * @returns {Promise}
 */
export function requestAction(requestId, action, phaseName, requestPayload) {
  let url = `/governance/requests/${requestId}?_action=${action}`;
  if (phaseName) url = `${url}&phaseName=${phaseName}`;

  return generateIgaApi().post(url, requestPayload);
}

/**
 * Saves new access request
 * @param {Object} payload request details to save
 * @returns {Promise} Contains data about created request
 */
export function saveNewRequest(payload) {
  return generateIgaApi().post('governance/requests?_action=create', payload);
}

/**
 * Validate a request for invalid entries
 * @param {String} payload ID of request
 * @param {Array} payload containing request details to validate
 * @returns {Promise}
 */
export function validateRequest(payload) {
  const url = '/governance/requests?_action=validate';
  return generateIgaApi().post(url, payload);
}

/**
 * Submits a custom access request.
 *
 * @param {string} requestTypeId - The ID of the request type.
 * @param {object} request - The request object.
 * @returns {Promise} A promise that contains the created request.
 */
export function submitCustomRequest(requestTypeId, request) {
  return generateIgaApi().post(`/governance/requests/${requestTypeId}?_action=publish`, request);
}
