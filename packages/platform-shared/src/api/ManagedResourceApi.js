/**
 * Copyright (c) 2019-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import encodeQueryString from '../utils/encodeQueryString';
import { generateIdmApi } from './BaseApi';

/**
  * Returns a managed resource details
  * @param {String} resourceName Specific managed resource path example: managed/user
  * @param {String} Id A managed resource _id
  *
  * @returns {Promise}
  */
// eslint-disable-next-line import/prefer-default-export
export function getManagedResource(resourceName, id) {
  return generateIdmApi().get(`managed/${resourceName}/${id}`);
}

/**
  * Deletes a managed resource details
  * @param {String} resourceName Specific managed resource path example: managed/user
  * @param {String} Id A managed resource _id
  *
  * @returns {Promise}
  */
// eslint-disable-next-line import/prefer-default-export
export function deleteManagedResource(resourceName, id) {
  return generateIdmApi().delete(`managed/${resourceName}/${id}`);
}

/**
 * Builds url to call for API to pull grid data of current managed resource
 *
 * @param {string} resourceName - Required resource name (e.g., user or role)
 * @param {object} params - Optional parameters to be plugged into query string
 * {
 *   queryFilter: String,
 *   fields: String,
 *   sortKeys: String,
 *   pageSize: String,
 *   totalPagedResultsPolicy: String,
 *   pagedResultsOffset: String,
 * }
 */
export function getManagedResourceList(resourceName, params) {
  const resourceUrl = `managed/${resourceName}${encodeQueryString(params)}`;
  return generateIdmApi().get(resourceUrl);
}

export function postManagedResource(resourceName, data, routeToForbidden = true) {
  const resourceUrl = `/managed/${resourceName}?_action=create`;
  return generateIdmApi(null, routeToForbidden).post(resourceUrl, data);
}

export function patchManagedResource(resourceName, resourceId, data) {
  const resourceUrl = `/managed/${resourceName}/${resourceId}`;
  return generateIdmApi().patch(resourceUrl, data);
}

export function putManagedResource(resourceName, resourceId, data, requestOverrides) {
  const resourceUrl = `/managed/${resourceName}/${resourceId}`;
  return generateIdmApi(requestOverrides).put(resourceUrl, data);
}

export function getLinkedApplications(resourceName, userId) {
  const resourceUrl = `/sync?_action=getLinkedResources&resourceName=managed/${resourceName}/${userId}`;
  return generateIdmApi().post(resourceUrl);
}
