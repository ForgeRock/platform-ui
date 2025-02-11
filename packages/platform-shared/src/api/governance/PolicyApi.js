/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const policyUrl = '/governance/policy';

/**
 * Check if requesting new entitlements will result in an SOD violation
 * @param {*} userId id of user the access is being requested for
 * @param {*} additionalAccess the additional entitlement access being requested
 * @returns Promise with violations if they are found
 */
export function scanNewEntitlementAccess(userId, additionalAccess) {
  return generateIgaApi().post(`${policyUrl}/user/${userId}/scan?simulate=true`, { additionalAccess });
}

/**
 * Retrieves list of policies
 * @param {object} params query parameters
 * @returns The response is a promise that resolves to a list of policies.
 */
export function getPolicyList(params) {
  return generateIgaApi().post(`${policyUrl}/search${encodeQueryString(params)}`);
}

/**
 * Retrieves list of policy rules
 * @param {object} params query parameters
 * @returns The response is a promise that resolves to a list of policy rules.
 */
export function getPolicyRuleList(params) {
  return generateIgaApi().post(`${policyUrl}/rule/search${encodeQueryString(params)}`);
}
