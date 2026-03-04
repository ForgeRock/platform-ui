/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as esvApi from '@forgerock/platform-shared/src/api/EsvApi';
import i18n from '@/i18n';
import {
  urlDomainOnly,
  validEmail,
  urlWithoutPath,
  urlWithPath,
  isValidESV,
  validJWT,
  minimumItems,
  validBookmarkUrl,
} from './validators';

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

  it('should pass urlWithoutPath when url does not include path', () => {
    const testVar = 'https://test.com';
    const result = urlWithoutPath(testVar, i18n);
    expect(result).toBe(true);
  });

  it('should return error message for urlWithoutPath when url includes path', () => {
    const testVar = 'https://test.com/xyz';
    const result = urlWithoutPath(testVar, i18n);
    expect(result).toBe('Please provide a valid URL that does not contain a path');
  });

  it('should pass urlWithPath when url does not includes path', () => {
    const testVar = 'https://test.com/path';
    const result = urlWithPath(testVar, i18n);
    expect(result).toBe(true);
  });

  it('should fail with error message for urlWithPath when url includes path', () => {
    const testVar = 'https://test.com';
    const result = urlWithPath(testVar, i18n);
    expect(result).toBe('Please provide a valid URL that contains a path');
  });

  it('should pass urlWithPath when url does not includes path', () => {
    const testVarArray = ['https://test.com/path1', 'https://test.com/path2', 'https://test.com/path3'];
    const result = urlWithPath(testVarArray, i18n);
    expect(result).toBe(true);
  });

  it('validBookmarkUrl should return true for valid bookmark url', () => {
    const testVar = 'https://test.com';
    const result = validBookmarkUrl(testVar);
    expect(result).toBe(true);
  });
});

describe('ESV validators', () => {
  it('isValidESV should return true when getVariable returns success response', async () => {
    const getVariableSpy = jest.spyOn(esvApi, 'getVariable').mockResolvedValue({ data: true, status: 200 });
    const result = await isValidESV('&{esv.test.success}');
    expect(getVariableSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('isValidESV should trigger getSecret when getVariable returns failure response', async () => {
    const getVariableSpy = jest.spyOn(esvApi, 'getVariable').mockResolvedValue({ data: false, status: 401 });
    const getSecretSpy = jest.spyOn(esvApi, 'getSecret').mockResolvedValue({ data: true, status: 200 });
    const result = await isValidESV('&{esv.test.failure}');
    expect(getVariableSpy).toHaveBeenCalled();
    expect(getSecretSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

describe('JWT validators', () => {
  it('isValidJWT should return true when value is a valid JWT', () => {
    const result = validJWT('eyJraWQiOiIwOWVlZmRiOC0xNmM3LTQ4ZjktYWU5Zi00ZTA3NDk0NDc5YzYiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJodHRwczovL2FwaS5waW5nb25lLmV1IiwiYXV0aFVybCI6Imh0dHBzOi8vYXV0aC5waW5nb25lLmV1IiwiY29uc29sZVVybCI6Imh0dHBzOi8vY29uc29sZS5waW5nb25lLmV1IiwiZW52aXJvbm1lbnROYW1lIjoiQWRtaW5pc3RyYXRvcnMiLCJlbnZpcm9ubWVudElkIjoiZDM3MTE4ODYtNmYyNS00YjdlLTk3NWMtZWM4ZmRhNWRiMWVkIiwib3JnYW5pemF0aW9uTmFtZSI6ImludGVybmFsX2FuZHJld2hlcnRlbF82MzM1MzQyNTIiLCJvcmdhbml6YXRpb25JZCI6ImQwNzM1MzExLTRjNWMtNGFhMi1iNWE0LTQ2NWRmMWEwMWRiMyIsImdhdGV3YXlOYW1lIjoiUGluZ0ZlZGVyYXRlMyIsImdhdGV3YXlJZCI6IjY0YzQ3YjQ3LTgyNTktNDVjMS05MzBiLTk1NzdmNTI5YjgyZSIsImdhdGV3YXlUeXBlIjoiUElOR19GRURFUkFURSIsInRhcmdldENsdXN0ZXJFbnZpcm9ubWVudCI6IlBST0QiLCJ0YXJnZXRHZW9ncmFwaHkiOiJFVSIsInJlZ2lvbiI6IkV1cm9wZSIsImRpcmVjdExkYXBVcmwiOiJodHRwczovL2FwaS5waW5nb25lLmV1IiwianRpIjoiOTFlYWEzYzctMjM5Yi00M2I5LWI4ZGYtNzk2ZDllNzI1ZWE1IiwiaXNzIjoid3NzOi8vZ2F0ZXdheXMucGluZ29uZS5ldSIsImlhdCI6MTc3MzE0MjQ3Nn0.F4tUTRdMWpMfStlTuF4VUG4OiegLf5npT4VPPKHcZahhvSzfR9q0Ws2Og_dHMNztST9C-JGpIP71y8xdyYJ_O_ckO2EOUtebMzitqFAKgptgwGrc25aJ4oBlRlB4gowApUODnlAra21f_KLNZxy38V6Bymwyx__Df7AavFqC6YybOfU4Uxh_QyBHLyK8wDPoCxU3Vy-g7fye1A6B0zVOvtaS4pmndB5yOPY48zfd7fkQxnYP_nKRZq8Wt_PJSjV8AyibK04Zs0e2EahAzHIP-4XHB6LPWxi3dkZSTjwiKQ-2CWcwa1WMv4e_tXcdrlK4wUkYLrXfmTatghERM-KCTw');
    expect(result).toBe(true);
  });

  it('isValidJWT should return false when value is not a valid JWT', () => {
    const result = validJWT('&{esv.test.failure}');
    expect(result).toBe(false);
  });
});

describe('minimumItems validators', () => {
  it('minimumItems should return true when array length is greater than the minItems', () => {
    const result = minimumItems([
      'test1', 'test2', 'test3',
    ], {
      minItems: 2,
    });
    expect(result).toBe(true);
  });

  it('minimumItems should return true when params object propertieslength is greater than the minItems', () => {
    const result = minimumItems({
      val1: 2,
      val2: 4,
      val3: 6,
      val4: 8,
    }, {
      minItems: 3,
    });
    expect(result).toBe(true);
  });
});
