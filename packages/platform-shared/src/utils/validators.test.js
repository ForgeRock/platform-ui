/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { urlDomainOnly, validEmail } from './validators';
import i18n from '@/i18n';

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

describe('url validators', () => {
  it('should fail urlDomainOnly when protocol is included', () => {
    const testVar = 'https://test.com';
    const result = urlDomainOnly(testVar, i18n);
    expect(result).toBe('Must be a valid URL containing only domain information');
  });

  it('should fail urlDomainOnly when no domain is included', () => {
    const testVar = 'test';
    const result = urlDomainOnly(testVar, i18n);
    expect(result).toBe('Must be a valid URL containing only domain information');
  });

  it('should fail urlDomainOnly when empty', () => {
    const testVar = '';
    const result = urlDomainOnly(testVar, i18n);
    expect(result).toBe('Must be a valid URL containing only domain information');
  });

  it('should fail urlDomainOnly when special characters are included', () => {
    const testVar = 'test$#¢.com';
    const result = urlDomainOnly(testVar, i18n);
    expect(result).toBe('Must be a valid URL containing only domain information');
  });

  it('should fail urlDomainOnly when path is included', () => {
    const testVar = 'test.com/path';
    const result = urlDomainOnly(testVar, i18n);
    expect(result).toBe('Must be a valid URL containing only domain information');
  });

  it('should pass urlDomainOnly when url is valid single domain', () => {
    const testVar = 'test.com';
    const result = urlDomainOnly(testVar, i18n);
    expect(result).toBe(true);
  });
});
