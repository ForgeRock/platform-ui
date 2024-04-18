/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const violationUrl = '/governance/violation';

// eslint-disable-next-line import/prefer-default-export
export function getViolationList(params, targetFilter) {
  return generateIgaApi().post(`${violationUrl}/search${encodeQueryString(params)}`, { targetFilter });
}
