/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  getAutocompleteValue,
  decodeJwt,
  getAlternateFieldType,
  getFieldValidation,
  getLinkToTreeStart,
  isSessionTimedOut,
} from './loginUtils';

describe('loginUtils', () => {
  describe('getAutocompleteValue', () => {
    describe('should return login form autocomplete value', () => {
      const testCases = [
        ['given User Name', 'user name', 'username'],
        ['given Username', 'username', 'username'],
        ['given First Name', 'first name', 'given-name'],
        ['given Last Name', 'last name', 'family-name'],
        ['given Email Address', 'email address', 'email'],
      ];
      it.each(testCases)('%s', (name, label, expectedAutocompleteValue) => {
        const autocompleteValue = getAutocompleteValue(label);
        expect(autocompleteValue).toBe(expectedAutocompleteValue);
      });
    });

    describe('should return false', () => {
      const testCases = [
        ['given false', false],
        ['given null', null],
        ['given undefined', undefined],
        ['given zero', 0],
        ['given negative zero', -0],
        ['given bigint', 0n],
        ['given NaN', NaN],
        ['given empty string', ''],
        ['given empty object', {}],
        ['given empty array', []],
      ];
      it.each(testCases)('%s', (name, label) => {
        const autocompleteValue = getAutocompleteValue(label);
        expect(autocompleteValue).toBe(false);
      });
    });
  });

  describe('decodeJwt', () => {
    it('should decode a valid JWT token', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
          + 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.'
          + 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const result = decodeJwt(token);
      expect(result).toEqual({ sub: '1234567890', name: 'John Doe', admin: true });
    });
  });

  describe('getAlternateFieldType', () => {
    it('should return "datetime" for VALID_DATE_TIME_FORMAT', () => {
      expect(getAlternateFieldType(['VALID_DATE_TIME_FORMAT'])).toBe('datetime');
    });
    it('should return "date" for VALID_DATE or VALID_DATE_FORMAT', () => {
      expect(getAlternateFieldType(['VALID_DATE'])).toBe('date');
      expect(getAlternateFieldType(['VALID_DATE_FORMAT'])).toBe('date');
    });
    it('should return "time" for VALID_TIME_FORMAT', () => {
      expect(getAlternateFieldType(['VALID_TIME_FORMAT'])).toBe('time');
    });
    it('should return "select" for VALID_ENUM_VALUE', () => {
      expect(getAlternateFieldType(['VALID_ENUM_VALUE'])).toBe('select');
    });
    it('should return empty string for unknown requirements', () => {
      expect(getAlternateFieldType(['UNKNOWN'])).toBe('');
    });
  });

  describe('getFieldValidation', () => {
    it('should return "email" for VALID_EMAIL_ADDRESS_FORMAT', () => {
      expect(getFieldValidation(['VALID_EMAIL_ADDRESS_FORMAT'])).toBe('email');
    });
    it('should return "required" for REQUIRED', () => {
      expect(getFieldValidation(['REQUIRED'])).toBe('required');
    });
    it('should return "email|required" for both requirements', () => {
      expect(getFieldValidation(['VALID_EMAIL_ADDRESS_FORMAT', 'REQUIRED'])).toBe('email|required');
    });
    it('should return null for no requirements', () => {
      expect(getFieldValidation([])).toBeNull();
    });
    it('should return null for unrelated requirements', () => {
      expect(getFieldValidation(['OTHER'])).toBeNull();
    });
  });

  describe('getLinkToTreeStart', () => {
    it('should return correct URL with all params', () => {
      const params = {
        tree: 'MyTree',
        realmPath: 'alpha',
        query: { goto: 'dashboard', gotoOnFail: 'error' },
      };
      const url = getLinkToTreeStart(params);
      expect(url).toBe('/am/XUI/?realm=alpha&authIndexType=service&authIndexValue=MyTree&goto=dashboard&gotoOnFail=error');
    });
    it('should return URL without goto params', () => {
      const params = {
        tree: 'MyTree',
        realmPath: 'alpha',
        query: {},
      };
      const url = getLinkToTreeStart(params);
      expect(url).toBe('/am/XUI/?realm=alpha&authIndexType=service&authIndexValue=MyTree');
    });
    it('should encode goto params', () => {
      const params = {
        tree: 'MyTree',
        realmPath: 'alpha',
        query: { goto: 'a b', gotoOnFail: 'c&d' },
      };
      const url = getLinkToTreeStart(params);
      expect(url).toContain('goto=a%20b');
      expect(url).toContain('gotoOnFail=c%26d');
    });
  });

  describe('isSessionTimedOut', () => {
    it('should return true for errorCode 110', () => {
      const payload = { detail: { errorCode: '110' } };
      expect(isSessionTimedOut(payload, false)).toBe(true);
    });
    it('should return true for suspendedIdWasSet and code 401', () => {
      const payload = { code: 401 };
      expect(isSessionTimedOut(payload, true)).toBe(true);
    });
    it('should return false for other error codes', () => {
      const payload = { detail: { errorCode: '999' }, code: 200 };
      expect(isSessionTimedOut(payload, false)).toBe(false);
    });
    it('should return false if suspendedIdWasSet is false and code is not 401', () => {
      const payload = { code: 200 };
      expect(isSessionTimedOut(payload, false)).toBe(false);
    });
  });
});
