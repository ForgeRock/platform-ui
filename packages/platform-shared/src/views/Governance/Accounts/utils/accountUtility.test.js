/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { getAccountTypeVariant, getAccountDisplayName } from './accountUtility';
import accountConstants from './accountConstants';

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
});
