/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const violationsUrl = '/governance/user/violation';

/**
 * Returns the violation items
 * @param {object} params - Optional parameters to be plugged into query string
 * @returns {Promise}
 */
export function getViolations(targetFilter, params) {
  const queryParams = encodeQueryString(params);
  const resourceUrl = `${violationsUrl}/search${queryParams}`;
  return generateIgaApi().post(resourceUrl, { targetFilter });
}
