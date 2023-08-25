/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import getAutocompleteValue from './loginUtils';

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
});
