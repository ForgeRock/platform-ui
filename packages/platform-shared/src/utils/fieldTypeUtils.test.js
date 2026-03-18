/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { checkPhonePolicy } from '@/utils/fieldTypeUtils';

describe('fieldTypeUtils', () => {
  describe('checkPhonePolicy', () => {
    it('returns `hasPhonePolicy: false` when there are no policies', () => {
      const { hasPhonePolicy, requireCountryCode } = checkPhonePolicy([]);
      expect(hasPhonePolicy).toBe(false);
      expect(requireCountryCode).toBe(false);
    });
    it('returns `hasPhonePolicy: false` when there is no policy id defined as `valid-phone-format`', () => {
      const { hasPhonePolicy, requireCountryCode } = checkPhonePolicy([{ policyId: 'some-other-policy' }]);
      expect(hasPhonePolicy).toBe(false);
      expect(requireCountryCode).toBe(false);
    });
    it('returns `hasPhonePolicy: true` and `requireCountryCode: false` when `valid-phone-format` is defined without param `require-country-code` set to true', () => {
      expect(checkPhonePolicy([{ policyId: 'valid-phone-format' }]).hasPhonePolicy).toBe(true);
      expect(checkPhonePolicy([{ policyId: 'valid-phone-format' }]).requireCountryCode).toBe(false);
      expect(checkPhonePolicy([{ policyId: 'valid-phone-format', params: { 'require-country-code': false } }]).requireCountryCode).toBe(false);
    });
    it('returns `requireCountryCode: true` when `valid-phone-format` is defined with param `require-country-code` set to true', () => {
      expect(checkPhonePolicy([{ policyId: 'valid-phone-format', params: { 'require-country-code': true } }]).hasPhonePolicy).toBe(true);
      expect(checkPhonePolicy([{ policyId: 'valid-phone-format', params: { 'require-country-code': true } }]).requireCountryCode).toBe(true);
      // Checking for string true in different cases as well, IDM only allows to set string value.
      expect(checkPhonePolicy([{ policyId: 'valid-phone-format', params: { 'require-country-code': 'true' } }]).requireCountryCode).toBe(true);
      expect(checkPhonePolicy([{ policyId: 'valid-phone-format', params: { 'require-country-code': 'True' } }]).requireCountryCode).toBe(true);
    });
  });
});
