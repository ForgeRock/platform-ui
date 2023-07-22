/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable no-unused-vars */
import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import {
  getRequestMock,
  getRequestsMock,
} from './AccessRequestApiMock';

export function searchRequests(params = {}, filter) {
  return Promise.resolve({ data: getRequestsMock(params, filter) });
  // const queryString = encodeQueryString(params, false);
  // return generateIgaApi().post('/requests/search${queryString}', filter);
}

export function getRequest(id) {
  return Promise.resolve({
    data: getRequestMock(id),
  });
}

export function getUserRequests(userId, params, filter) {
  params.action = 'search';
  const queryString = encodeQueryString(params, true);
  return generateIgaApi().post(`/governance/user/${userId}/requests${queryString}`, { targetFilter: filter });
}

export function getUserApprovals(userId, params, filter) {
  return Promise.resolve({ data: getRequestsMock(params, filter) });
  // /governance/user/{userId}/approvals
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

export function getRequestsItems(userId, params) {
  return Promise.resolve({
    data: {
      totalCount: 0,
    },
  });
  // return generateIgaApi().get(`/user/${userId}/requests`);
}

export function getApprovalsItems(userId, params) {
  return Promise.resolve({
    data: {
      totalCount: 0,
    },
  });
  // return generateIgaApi().get(`/user/${userId}/approvals`);
}

export function saveNewRequest(payload) {
  return generateIgaApi().post('governance/requests?_action=create', payload);
}
