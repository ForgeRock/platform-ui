/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { each } from 'lodash';
import { generateIdmApi } from './BaseApi';

/**
  * Returns a internal resource details
  * @param {String} resourceName Specific internal resource path example: internal/user
  * @param {String} Id An internal resource _id
  *
  * @returns {Promise}
  */
// eslint-disable-next-line import/prefer-default-export
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
// eslint-disable-next-line import/prefer-default-export
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
  let resourceUrl = `internal/${resourceName}`;
  let prependChar = '?';

  if (params) {
    each(params, (value, key) => {
      resourceUrl += `${prependChar}_${key}=${value}`;
      prependChar = '&';
    });
  }

  return generateIdmApi().get(resourceUrl);
}
