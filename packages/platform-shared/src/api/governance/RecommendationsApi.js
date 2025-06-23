/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import { convertTargetFilterToQueryFilter } from '@forgerock/platform-shared/src/utils/governance/filters';

/**
 * Retrieves recommendations for a specified user.
 *
 * @param {string} userId - The ID of the user for whom to retrieve recommendations.
 * @param {Object} params - The parameters for the API request.
 * @param {Object} targetFilter - To support existing UI components that are using targetFilter searching
 * @returns {Promise} A promise that resolves to the users recommendations.
 */
// eslint-disable-next-line import/prefer-default-export
export function getUserRecommendations(userId, params, targetFilter) {
  if (targetFilter && !params.queryFilter) {
    params.queryFilter = convertTargetFilterToQueryFilter(targetFilter);
  }
  const queryString = encodeQueryString(params);
  return generateIgaApi().get(`/governance/user/${userId}/recommendations${queryString}`);
}
