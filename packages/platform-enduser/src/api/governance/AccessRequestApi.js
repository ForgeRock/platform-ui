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
