/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { get } from 'lodash';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import accountConstants from './accountConstants';

/**
 * Get the badge variant for various account types
 * @returns badge variant
 */
export function getAccountTypeVariant(accountType) {
  const type = accountType.toLowerCase();
  if (type === accountConstants.ACCOUNT_TYPES.DEFAULT) {
    return 'light';
  }
  if (type === accountConstants.ACCOUNT_TYPES.MACHINE) {
    return 'warning';
  }
  return 'light';
}

/**
 * Get the display name from an account
 * @param {object} account Account object
 * @returns Display name
 */
export function getAccountDisplayName(account) {
  return get(account, 'descriptor.idx./account.displayName') || account?.__NAME__ || blankValueIndicator;
}
