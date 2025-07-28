/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable import/prefer-default-export */
/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const applicationUrl = 'governance/application';

/**
 * Fetches the list of applications based on the provided resource and query parameters.
 *
 * @param {string} resource - The resource identifier for the application list.
 * @param {Object} [queryParams={}] - An optional object containing query parameters to filter the application list.
 * @returns {Promise} - A promise that resolves to the list of applications.
 */
export function getApplications(resource, queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${applicationUrl}${encodedQueryParams}`);
}
