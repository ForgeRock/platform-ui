/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import encodeQueryString from '../utils/encodeQueryString';
import { generateIdmApi } from './BaseApi';

/**
  * Returns a managed resource details
  * @param {String} resourceName Specific managed resource path example: managed/user
  * @param {String} id A managed resource _id
  * @param {Object} params Additional query parameters to be encoded
  *
  * @returns {Promise}
  */
export function getManagedResource(resourceName, id, params) {
  return generateIdmApi().get(`managed/${resourceName}/${id}${encodeQueryString(params)}`);
}

/**
  * Deletes a managed resource details
  * @param {String} resourceName Specific managed resource path example: managed/user
  * @param {String} id A managed resource _id
  *
  * @returns {Promise}
  */
export function deleteManagedResource(resourceName, id) {
  return generateIdmApi().delete(`managed/${resourceName}/${id}`);
}

/**
 * Builds an API url to call for a managed relationship resource
 *
 * @param {string} resourceName - Required resource name (e.g., user or role)
 * @param {string} resourceId - Required resource id
 * @param {string} relationshipName - Required relationship name (e.g., assignments or applications)
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
export function getManagedRelationshipList(resourceName, resourceId, relationshipName, params) {
  const resourceUrl = `managed/${resourceName}/${resourceId}/${relationshipName}${encodeQueryString(params)}`;
  return generateIdmApi().get(resourceUrl);
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
export function getManagedResourceList(resourceName, params, requestOverride) {
  const resourceUrl = `managed/${resourceName}${encodeQueryString(params)}`;
  return generateIdmApi(requestOverride).get(resourceUrl);
}

export function postManagedResource(resourceName, data, routeToForbidden = true) {
  const resourceUrl = `managed/${resourceName}?_action=create`;
  return generateIdmApi(null, routeToForbidden).post(resourceUrl, data);
}

/**
 * Adds or removes one or more values from one or more fields in a managed resource
 * @param {String} resourceName name of managed resource. e.g., user, alpha_role, <realm>_<name>
 * @param {String} resourceId id of specific resource being patched
 * @param {Object} data patch request payload
 * @param {Object} requestOverride override properties or headers to pass along to idm api
 * @returns Promise containing results of patch (success or failure)
 */
export function patchManagedResource(resourceName, resourceId, data, requestOverride) {
  const resourceUrl = `managed/${resourceName}/${resourceId}`;
  return generateIdmApi(requestOverride).patch(resourceUrl, data);
}

export function putManagedResource(resourceName, resourceId, data, requestOverrides) {
  const resourceUrl = `managed/${resourceName}/${resourceId}`;
  return generateIdmApi(requestOverrides).put(resourceUrl, data);
}

export function getLinkedApplications(resourceName, userId) {
  const resourceUrl = `sync?_action=getLinkedResources&resourceName=managed/${resourceName}/${userId}`;
  return generateIdmApi().post(resourceUrl);
}

export function getManagedResourceCount(resourceName) {
  const managedResourceParams = {
    countOnly: true,
    queryFilter: 'true',
    totalPagedResultsPolicy: 'EXACT',
  };
  const headers = {
    'accept-api-version': 'protocol=2.2,resource=1.0',
  };
  return getManagedResourceList(resourceName, managedResourceParams, { headers });
}
