/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  get, find, cloneDeep, map,
} from 'lodash';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import accountConstants from './accountConstants';
import i18n from '@/i18n';

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

/**
 * Get the list of props that should be displayed in the update form for an account type
 * @param {string} accountType Account type
 * @returns The list of properties
 */
function getGlossaryPropsByAccountType(accountType) {
  const accountGlossaryProps = {
    [accountConstants.ACCOUNT_TYPES.DEFAULT]: ['accountType'],
    [accountConstants.ACCOUNT_TYPES.MACHINE]: ['accountType', 'accountSubtype', 'actors'],
    [accountConstants.ACCOUNT_TYPES.AGENT]: ['accountType', 'actors'],
  };
  return accountGlossaryProps[accountType?.toLowerCase()] || accountGlossaryProps[accountConstants.ACCOUNT_TYPES.DEFAULT];
}

/**
 * Returns a curated account schema based on how it should be displayed in the UI for a given account type
 * @param {string} accountType  Account type
 * @param {object} glossarySchema Account glossary schema
 * @returns Updated schema
 */
export function adjustAccountGlossaryForDisplay(accountType, glossarySchema) {
  const propsToShow = getGlossaryPropsByAccountType(accountType);
  const accountSchema = [];
  propsToShow.forEach((property) => {
    const entry = find(glossarySchema, { name: property });
    if (entry) {
      if (property === 'accountType') {
        const accountTypeEntry = cloneDeep(entry);
        accountTypeEntry.displayName = i18n.global.t('governance.accounts.accountType');
        accountTypeEntry.type = 'string';
        accountTypeEntry.enumeratedValues = map(accountConstants.ACCOUNT_TYPES, (value) => ({
          text: i18n.global.t(`governance.accounts.accountTypes.${value}`),
          value,
        }));
        accountSchema.push(accountTypeEntry);
      } else if (property === 'accountSubtype') {
        const accountSubTypeEntry = cloneDeep(entry);
        accountSubTypeEntry.displayName = i18n.global.t('governance.accounts.accountSubType');
        accountSubTypeEntry.type = 'string';
        accountSubTypeEntry.enumeratedValues = accountConstants.ACCOUNT_SUBTYPES;
        accountSchema.push(accountSubTypeEntry);
      } else if (property === 'actors') {
        const actorEntry = cloneDeep(entry);
        actorEntry.displayName = i18n.global.t('governance.accounts.custodians');
        actorEntry.type = 'managedObject';
        actorEntry.managedObjectType = '/openidm/managed/user';
        accountSchema.push(actorEntry);
      } else accountSchema.push(entry);
    }
  });
  return accountSchema;
}
