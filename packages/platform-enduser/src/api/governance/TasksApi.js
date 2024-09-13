/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

/**
 * Retrieves fulfillment tasks for a specified user.
 *
 * @param {string} userId - The ID of the user for whom to retrieve tasks.
 * @param {Object} params - The parameters for the API request.
 * @param {Object} filter - The target filter to apply to the query.
 * @returns {Promise} A promise that resolves to the users fulfillment tasks.
 */
// eslint-disable-next-line import/prefer-default-export
export function getUserFulfillmentTasks(userId, params, filter) {
  params._action = 'search';
  params.type = 'fulfillment';
  const queryString = encodeQueryString(params, false);
  return generateIgaApi().post(`/governance/user/${userId}/tasks${queryString}`, { targetFilter: filter });
}
