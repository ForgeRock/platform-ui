/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const governanceUserUrl = '/governance/user';

/**
 * Get list of My Access for a given user
 * @param {String} userId - id of user to retrieve proxies for
 * @param {object} params - parameters to filter the list of my access
 * @returns {Promise}
 */

// eslint-disable-next-line import/prefer-default-export
export async function getMyAccess(userId, params) {
  const queryString = encodeQueryString(params, false);
  return generateIgaApi().get(`${governanceUserUrl}/${userId}/grants${queryString}`);
}
