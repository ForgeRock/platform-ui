/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const requestTypeUrl = '/governance/requestTypes';

/**
 * Retrieves custom request types based on the provided query string.
 *
 * @param {string} queryString - The query string used to filter the request types.
 * @returns {Promise} A promise that resolves to the response containing the custom request types.
 */
// eslint-disable-next-line import/prefer-default-export
export function getCustomRequestTypes(queryString) {
  const params = { queryFilter: 'custom eq "true"' };
  if (queryString) {
    params.queryFilter = `${params.queryFilter} and (id co "${queryString}" or displayName co "${queryString}")`;
  }
  const queryParams = encodeQueryString(params);

  return generateIgaApi().get(`${requestTypeUrl}${queryParams}`);
}
