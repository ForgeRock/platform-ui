/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getAccountTypeVariant, getAccountDisplayName, adjustAccountGlossaryForDisplay } from './accountUtility';
import accountConstants from './accountConstants';

const testSchema = [
  {
    id: '25124190-a499-47f6-9737-6c8529bd9acd',
    displayName: 'Account Type',
    name: 'accountType',
    description: 'The type of account',
    objectType: '/iga/governance/account',
    type: 'string',
    isMultiValue: false,
    enumeratedValues: [],
    searchable: true,
    isInternal: true,
  },
  {
    id: '25124190-a499-47f6-9737-6c8529bd9bbe',
    displayName: 'Account Sub Type',
    name: 'accountSubtype',
    description: 'The subtype of account',
    objectType: '/iga/governance/account',
    type: 'string',
    isMultiValue: false,
    enumeratedValues: [],
    searchable: true,
    isInternal: true,
  },
  {
    id: '09c470af-abc5-4733-beaf-3d169b62a234',
    displayName: 'Actors',
    name: 'actors',
    description: 'Actors for the account',
    objectType: '/iga/governance/account',
    type: 'string',
    isMultiValue: true,
    enumeratedValues: [],
    searchable: true,
    isInternal: true,
  },
];

describe('Account Utility Functions', () => {
  describe('getAccountTypeVariant', () => {
    it('should return correct badge variant for admin account type', () => {
      const result = getAccountTypeVariant(accountConstants.ACCOUNT_TYPES.DEFAULT);
      expect(result).toBe('light'); // Replace with actual expected value
    });

    it('should return correct badge variant for user account type', () => {
      const result = getAccountTypeVariant(accountConstants.ACCOUNT_TYPES.MACHINE);
      expect(result).toBe('warning'); // Replace with actual expected value
    });

    it('should return default badge variant for unknown account type', () => {
      const result = getAccountTypeVariant('unknown');
      expect(result).toBe('light'); // Replace with actual expected value
    });
  });

  describe('getAccountDisplayName', () => {
    it('should return display name from account descriptor', () => {
      const account = { descriptor: { idx: { '/account': { displayName: 'John Doe' } } } };
      const result = getAccountDisplayName(account);
      expect(result).toBe('John Doe');
    });

    it('should return fallback name when display name is not available', () => {
      const account = { __NAME__: 'Fallback Name' };
      const result = getAccountDisplayName(account);
      expect(result).toBe('Fallback Name');
    });

    it('should return empty string for account with no display name or fallback', () => {
      const account = {};
      const result = getAccountDisplayName(account);
      expect(result).toBe(blankValueIndicator);
    });
  });

  describe('adjustAccountGlossaryForDisplay', () => {
    it('should adjust account glossary for default account correctly', () => {
      const accountSchema = adjustAccountGlossaryForDisplay(accountConstants.ACCOUNT_TYPES.DEFAULT, testSchema);
      expect(accountSchema).toBeDefined();
      expect(accountSchema.length).toBe(1);
      expect(accountSchema[0].displayName).toBe('Account Type');
      expect(accountSchema[0].enumeratedValues.length).toBe(Object.keys(accountConstants.ACCOUNT_TYPES).length);
    });

    it('should adjust account glossary for machine account correctly', () => {
      const accountSchema = adjustAccountGlossaryForDisplay(accountConstants.ACCOUNT_TYPES.MACHINE, testSchema);
      expect(accountSchema).toBeDefined();
      expect(accountSchema.length).toBe(3);
      expect(accountSchema[1].displayName).toBe('Account Subtype');
      expect(accountSchema[1].enumeratedValues.length).toBe(accountConstants.ACCOUNT_SUBTYPES.length);
      expect(accountSchema[2].displayName).toBe('Custodians');
      expect(accountSchema[2].type).toBe('managedObject');
      expect(accountSchema[2].managedObjectType).toBe('/openidm/managed/user');
    });

    it('should adjust account glossary for agent account type correctly', () => {
      const accountSchema = adjustAccountGlossaryForDisplay(accountConstants.ACCOUNT_TYPES.AGENT, testSchema);
      expect(accountSchema).toBeDefined();
      expect(accountSchema.length).toBe(2);
      expect(accountSchema[1].displayName).toBe('Custodians');
      expect(accountSchema[1].type).toBe('managedObject');
      expect(accountSchema[1].managedObjectType).toBe('/openidm/managed/user');
    });
  });
});
