/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
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

export function getRequest(requestId) {
  return generateIgaApi().get(`/governance/requests/${requestId}`);
}

export function getUserApprovals(userId, params, filter) {
  params._action = 'search';
  const queryString = encodeQueryString(params, false);
  return generateIgaApi().post(`/governance/user/${userId}/approvals${queryString}`, { targetFilter: filter });
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
