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
  let resourceUrl = `managed/${resourceName}`;
  let prependChar = '?';

  if (params) {
    each(params, (value, key) => {
      resourceUrl += `${prependChar}_${key}=${value}`;
      prependChar = '&';
    });
  }

  return generateIdmApi().get(resourceUrl);
}
