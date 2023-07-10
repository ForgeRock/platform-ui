/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable no-unused-vars */
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
  return Promise.resolve({ data: getRequestsMock(params, filter) });
  // /governance/user/{userId}/requests
}

export function getUserApprovals(userId, params, filter) {
  return Promise.resolve({ data: getRequestsMock(params, filter) });
  // /governance/user/{userId}/approvals
}

export function cancelRequest(id) {
  return Promise.resolve();
  // return generateIgaApi().post('/requests/${requestId}/cancel');
}

export function approveRequest(id, phaseName) {
  return Promise.resolve();
  // return generateIgaApi().post('/requests/{requestId}/phases/{phaseName}/approve);
}

export function rejectRequest(id, phaseName) {
  return Promise.resolve();
  // return generateIgaApi().post('/requests/{requestId}/phases/{phaseName}/reject');
}

export function commentRequest(id, phaseName, comment) {
  return Promise.resolve();
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
