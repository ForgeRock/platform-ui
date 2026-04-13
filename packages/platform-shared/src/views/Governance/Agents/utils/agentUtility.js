/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { get } from 'lodash';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import agentConstants from './agentConstants';

/**
 * Get the badge variant for various account types
 * @returns badge variant
 */
export function getAgentTypeVariant(accountType) {
  if (!accountType) return 'light';
  const type = accountType.toLowerCase();
  if (type === agentConstants.ACCOUNT_TYPES.DEFAULT) {
    return 'light';
  }
  if (type === agentConstants.ACCOUNT_TYPES.MACHINE) {
    return 'warning';
  }
  return 'light';
}

/**
 * Get the display name from an account
 * @param {object} account Account object
 * @returns Display name
 */
export function getAgentDisplayName(account) {
  return get(account, 'descriptor.idx./account.displayName') || account?.__NAME__ || blankValueIndicator;
}
