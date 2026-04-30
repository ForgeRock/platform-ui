/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIdmApi, generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const applicationUrl = 'governance/application';

/**
 ***** NOTE: This is being used in place of an in-progress IGA API.  It is calling an openidm/system API, so
 ***** calling this can only be done from the platform-admin usage of a shared component.  This will be updated
 ***** as soon as possible
 *
 * Get system resources for a connector and object type
 * pagedResultsCookie should not be encoded if its included
 *
 * @param {String} connectorId ID of connector
 * @param {String} objectTypeName name of object type
 * @param {Object} params query params object (_queryFilter, _sortKeys, _fields, etc.)
 * @returns {Promise}
 */
async function getSystemResourceList(connectorId, objectTypeName, params) {
  let cookie = null;
  if (params._pagedResultsCookie) {
    cookie = params._pagedResultsCookie;
    delete params._pagedResultsCookie;
  }

  let encodedParams = encodeQueryString(params);
  // If a pagedResultsCookie is encoded, it will not work properly
  if (cookie !== null) {
    encodedParams = `${encodedParams}&_pagedResultsCookie=${cookie}`;
  }

  const resourceUrl = `/system/${connectorId}/${objectTypeName}${encodedParams}`;
  return generateIdmApi().get(resourceUrl);
}

/**
 * Given a connector, object type, and id list, fetch the matching system resources
 * @param {object} queryParams IDM query parameters
 * @param {string} connectorId ID of application connector
 * @param {string} objectType Object type ID
 * @param {Array} idList List of ids to fetch
 * @returns List of system resource objects
 */
async function getConnectorObjectsByIds(queryParams = {}, connectorId, objectType, idList) {
  const idFilter = idList.map((id) => `_id eq "${id}"`).join(' or ');
  const _queryFilter = idList.length > 0 ? idFilter : 'true';
  const updatedQueryParams = {
    ...queryParams,
    _queryFilter,
  };
  return getSystemResourceList(connectorId, objectType, updatedQueryParams);
}

/**
 * Given a disconnected application ID, object type, and id list, fetch the matching application resources
 * @param {object} queryParams IDM query parameters
 * @param {string} applicationId ID of application
 * @param {string} objectType Object type ID
 * @param {Array} idList List of ids to fetch
 * @returns List of application resource objects
 */
async function getApplicationObjectsByIds(queryParams = {}, applicationId, objectType, idList) {
  const idFilter = idList.map((id) => `id eq "${id}"`).join(' or ');
  const objectTypeFilter = `objectType eq "${objectType}"`;
  const _queryFilter = `${objectTypeFilter}${idList.length > 0 ? ` and (${idFilter})` : ''}`;
  const updatedQueryParams = {
    ...queryParams,
    _queryFilter,
  };
  const encodedQueryParams = encodeQueryString(updatedQueryParams);
  return generateIgaApi().get(`${applicationUrl}/${applicationId}/resources${encodedQueryParams}`);
}

/**
 * Given an application object, resource type, and id list, fetch the matching resources
 * @param {object} queryParams IDM query parameters
 * @param {object} application Application object
 * @param {string} resourceType Resource type ID
 * @param {Array} idList List of ids to fetch
 * @returns List of resource objects
 */
// eslint-disable-next-line import/prefer-default-export
export async function getAgentResourcesByIds(queryParams = {}, application, resourceType, idList) {
  if (application.isDisconnected) {
    return getApplicationObjectsByIds(queryParams, application.id, resourceType, idList);
  }
  return getConnectorObjectsByIds(queryParams, application.connectorId, resourceType, idList);
}
