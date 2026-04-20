/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const activityUrl = 'governance/activity';

/**
 * Get a list of activity logs.
 *
 * @param {Object} queryParams - The query parameters to include in the request.
 * @returns {Promise} - A promise that resolves to a list of activity logs.
 */
export async function getActivityLogs(queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${activityUrl}${encodedQueryParams}`);
}

/**
 * Get a list of activity logs for a specific object.
 *
 * @param {string} objectId - The ID of the object to filter activity logs by.
 * @param {string} objectType - The type of the object to filter activity logs by.
 * @param {Object} queryParams - The query parameters to include in the request.
 * @returns {Promise} - A promise that resolves to a list of activity logs.
 */
export async function getActivityLogsForObject(objectId, objectType, queryParams = {}) {
  const query = { ...queryParams };
  if (objectId) {
    query.object_id = objectId;
  }
  if (objectType) {
    query.object_type = objectType;
  }
  return getActivityLogs(query);
}
