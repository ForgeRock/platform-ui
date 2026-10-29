/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const scopeUrl = '/governance/scope';

/**
 * Put scope
 * @param {object} scopeId id of the scope to modify
 * @param {object} updatedScope new scope
 * @returns The response is a promise that resolves to the new scope.
 */
export function putScope(scopeId, updatedScope) {
  return generateIgaApi().put(`${scopeUrl}/${scopeId}`, updatedScope);
}

/**
 * Get scope
 * @param {object} scopeId id of the scope to get the info
 * @returns The response is a promise that resolves to the selected scope.
 */
export function getScope(scopeId) {
  return generateIgaApi().get(`${scopeUrl}/${scopeId}`);
}

/**
 * Get list of governance scopes
 * @param {object} params query parameters passed to the backend
 * @returns The response is a promise that resolves to the data (including list of scopes) returned by the API.
 */
export function getScopeList(params = { _pageSize: 10 }) {
  return generateIgaApi().get(`${scopeUrl}${encodeQueryString(params)}`);
}

/**
 * Get list of governance scope filter properties
 * @param {String} resourceName resource name to obtain properties for
 * @returns The response is a promise that resolves to the data (including list of resource properties) returned by the API.
 */
export function getFilterProperties(resourceName = 'user') {
  return generateIgaApi().get(`${scopeUrl}/entity/${resourceName}`);
}

/**
 * Delete an scope
 * @param {string} id scope id to delete
 */
export function deleteScope(scopeId) {
  return generateIgaApi().delete(`${scopeUrl}/${scopeId}`);
}

/**
 * update scope
 * @param {object} scopeId id of the scope to modify
 * @param {object} updatedScope properties to be updated on the scope
 */
export function updateScope(scopeId, updatedScope) {
  return generateIgaApi().patch(`${scopeUrl}/${scopeId}`, updatedScope);
}

/**
 * create scope
 * @param {object} scope properties to create scope
 * @returns The response is a promise that resolves to the creation of an scope.
 */
export function createScope(scope) {
  const params = { _action: 'create' };
  return generateIgaApi().post(`${scopeUrl}${encodeQueryString(params)}`, scope);
}
