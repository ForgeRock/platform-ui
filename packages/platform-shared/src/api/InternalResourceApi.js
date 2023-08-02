/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import encodeQueryString from '../utils/encodeQueryString';
import { generateIdmApi } from './BaseApi';

/**
  * Returns a internal resource details
  * @param {String} resourceName Specific internal resource path example: internal/user
  * @param {String} Id An internal resource _id
  *
  * @returns {Promise}
  */
export function getInternalResource(resourceName, id) {
  return generateIdmApi().get(`internal/${resourceName}/${id}`);
}

/**
  * Deletes an internal resource details
  * @param {String} resourceName Specific internal resource path example: managed/user
  * @param {String} Id An internal resource _id
  *
  * @returns {Promise}
  */
export function deleteInternalResource(resourceName, id) {
  return generateIdmApi().delete(`internal/${resourceName}/${id}`);
}

/**
 * Builds url to call for API to pull grid data of current internal resource
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
export function getInternalResourceList(resourceName, params) {
  const resourceUrl = `internal/${resourceName}${encodeQueryString(params)}`;
  return generateIdmApi().get(resourceUrl);
}
