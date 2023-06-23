/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const governanceCertificationItemsUrl = '/governance/certification/items';

/**
 * Returns the certification items
 * @param {object} params - Optional parameters to be plugged into query string
 * @returns {Promise}
 */
// eslint-disable-next-line import/prefer-default-export
export function getCertificationItems(params) {
  const queryParams = encodeQueryString(params, false);
  const resourceUrl = `${governanceCertificationItemsUrl}${queryParams}`;
  return generateIgaApi().get(resourceUrl);
}
