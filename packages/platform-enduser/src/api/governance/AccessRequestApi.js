/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable no-unused-vars */
import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

export function getUserRequests(userId, params, filter) {
  params.action = 'search';
  const queryString = encodeQueryString(params, true);
  return generateIgaApi().post(`/governance/user/${userId}/requests${queryString}`, { targetFilter: filter });
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
 * @param {String} comments Comments to leave on request
 * @param {Array} updatedActors Actor who the request will be forwarded to
 * @returns {Promise}
 */
export function requestAction(requestId, action, phaseName, comments, updatedActors) {
  const url = `/governance/requests/${requestId}?_action=${action}&phaseName=${phaseName}`;
  return Promise.resolve();
  // return generateIgaApi().post(url, { comments, updatedActors });
  // return generateIgaApi().post('/requests/{requestId}/phases/{phaseName}/comment', { comment });
}

export function saveNewRequest(payload) {
  return generateIgaApi().post('governance/requests?_action=create', payload);
}
