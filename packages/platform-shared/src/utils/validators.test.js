/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { validEmail } from './validators';

const nonEnglishEmailAddresses = [
  '用户@例子.广告',
  'квіточка@пошта.укр',
  'χρήστης@παράδειγμα.ελ',
  'Dörte@Sörensen.example.com',
  'коля@пример.рф',
];

const englishEmailAddresses = [
  'test@example.com',
  'test-user@example.com',
  'test+user@example.com',
  'test_user@example.com',
];

const disallowedEmailAddresses = [
  'test user@example.com',
  'test-user@example',
  'testuserexample.com',
  '@example.com',
  'test%example.com',
];

// These are valid based on our previous use of vee validate's email validator
// @link https://github.com/logaretm/vee-validate/blob/main/packages/rules/src/email.ts#L8
// @link https://github.com/logaretm/vee-validate/blob/main/packages/rules/src/utils.ts#L6
const emptyEmailAddresses = [
  '',
  null,
  undefined,
];

describe('email address validators', () => {
  it('should return true if property passed in is a Vue ref-like value', () => {
    // Convert values to be similar to a Vue ref and validate
    const refArray = nonEnglishEmailAddresses.map((address) => ({ value: address }));
    const refArrayResult = validEmail(refArray);
    expect(refArrayResult).toBe(true);

    // Validate singular
    nonEnglishEmailAddresses.forEach((emailAddress) => {
      expect(validEmail({ value: emailAddress })).toBe(true);
    });
  });

  it('should return true for an email with non-English characters', () => {
    // Validate array
    const result = validEmail(nonEnglishEmailAddresses);
    expect(result).toBe(true);

    // Validate singular
    nonEnglishEmailAddresses.forEach((emailAddress) => {
      expect(validEmail(emailAddress)).toBe(true);
    });
  });

  it('should return true for an email with English characters', () => {
    // Validate array
    const result = validEmail(englishEmailAddresses);
    expect(result).toBe(true);

    // Validate singular
    englishEmailAddresses.forEach((emailAddress) => {
      expect(validEmail(emailAddress)).toBe(true);
    });
  });

  it('should return false for an email with disallowed characters', () => {
    // Validate array
    const result = validEmail(disallowedEmailAddresses);
    expect(result).toBe(false);

    // Validate singular
    disallowedEmailAddresses.forEach((emailAddress) => {
      expect(validEmail(emailAddress)).toBe(false);
    });
  });

  it('should return true for an empty email address', () => {
    // Validate array
    const result = validEmail(emptyEmailAddresses);
    expect(result).toBe(true);

    // Validate singular
    emptyEmailAddresses.forEach((emailAddress) => {
      expect(validEmail(emailAddress)).toBe(true);
    });
  });
});
