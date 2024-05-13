/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';

const policyUrl = '/governance/policy/user';

/**
 * Check if requesting new entitlements will result in an SOD violation
 * @param {*} userId id of user the access is being requested for
 * @param {*} additionalAccess the additional entitlement access being requested
 * @returns Promise with violations if they are found
 */
// eslint-disable-next-line import/prefer-default-export
export function scanNewEntitlementAccess(userId, additionalAccess) {
  return generateIgaApi().post(`${policyUrl}/${userId}/scan?simulate=true`, { additionalAccess });
}
