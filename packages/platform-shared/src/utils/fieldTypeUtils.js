/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Checks if `policies` has a `valid-phone-format` policyId and if it has param
 * `require-country-code` set to `true`.
 * @param {Array} policies
 * @returns {{hasPhonePolicy: Boolean, requireCountryCode: Boolean}}
 */
export function checkPhonePolicy(policies = []) {
  const phonePolicy = policies?.find((p) => p.policyId === 'valid-phone-format');
  return {
    hasPhonePolicy: phonePolicy !== undefined,
    requireCountryCode: phonePolicy?.params?.['require-country-code']?.toString().toLowerCase() === 'true',
  };
}
