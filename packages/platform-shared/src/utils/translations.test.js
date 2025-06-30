/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createI18n } from 'vue-i18n';
import {
  translationExists,
  toTranslationKey,
  getLocalizedString,
  isTranslationKey,
  getTranslation,
  getEnumTranslation,
} from './translations';
import * as i18n from '@/i18n';

describe('translation util', () => {
  const enumMock = {
    messages: {
      en: {
        pingTranslations: {
          enum: {
            favoriteColor: {
              red: 'en Red',
              green: 'en Green',
              blue: 'en Blue',
            },
            favoriteFruit: {
              apple: 'en Apple',
              banana: 'en Banana',
              orange: 'en Orange',
            },
          },
        },
      },
    },
  };
  const enumMockWithOverrides = {
    messages: {
      en: {
        pingTranslations: {
          enum: {
            favoriteColor: {
              red: 'en Red',
              green: 'en Green',
              blue: 'en Blue',
            },
            favoriteFruit: {
              apple: 'en Apple',
              banana: 'en Banana',
              orange: 'en Orange',
            },
          },
        },
        overrides: {
          yellow: 'en Yellow',
          gray: 'en Gray',
          black: 'en Black',
        },
      },
    },
  };
  function setupUiLocaleMock(mockData) {
    i18n.default = createI18n({
      locale: 'en',
      messages: {
        en: {
          overrides: {
            testkey: 'test value',
            testkey2: 'test value 2',
            testkey3: 'test value 3',
          },
        },
      },
      silentFallbackWarn: true,
      silentTranslationWarn: true,
      ...mockData,
    });
  }

  describe('translationExists function', () => {
    it('returns true if a translation exists at the path', () => {
      setupUiLocaleMock();
      expect(translationExists('overrides.testkey')).toBe(true);
    });
    it('returns false if a translation does not exist at the path', () => {
      setupUiLocaleMock();
      expect(translationExists('badkey')).toBe(false);
    });
  });

  describe('toTranslationKey function', () => {
    it('removes all non alpha numeric characters from a string', () => {
      setupUiLocaleMock();
      const text = 'test123!@#$%^&*()-=+[]{};:" <>,./?|`~*\\_';
      expect(toTranslationKey(text)).toEqual('test123');
    });

    it('Handles text containing html without error', () => {
      setupUiLocaleMock();
      const textWithHtml = 'Make this application an authoritative source of identity data. <a target="_blank" href="https://backstage.forgerock.com/docs/idcloud/latest/app-management/applications.html#target_and_authoritative_applications">Learn more</a>';
      const htmlTextWithSpecialCharactersAndSpacesRemoved = 'MakethisapplicationanauthoritativesourceofidentitydataatargetblankhrefhttpsbackstageforgerockcomdocsidcloudlatestappmanagementapplicationshtmltargetandauthoritativeapplicationsLearnmorea';
      expect(toTranslationKey(textWithHtml)).toEqual(htmlTextWithSpecialCharactersAndSpacesRemoved);
    });

    it('handles other languages with non-english characters', () => {
      setupUiLocaleMock();
      const textWithNonEnglishCharacters = 'Hi! мир! 你好，世界! こんにちは@, 안녕하세요! 会话已超时 üéé';
      expect(toTranslationKey(textWithNonEnglishCharacters)).toEqual('Hiмир你好世界こんにちは안녕하세요会话已超时üéé');
    });
  });

  describe('isTranslationKey function', () => {
    it('returns true if the string is a valid translation key', () => {
      setupUiLocaleMock();
      expect(isTranslationKey('test.key')).toBe(true);
    });

    it('returns false if the string is not a valid translation key', () => {
      setupUiLocaleMock();
      expect(isTranslationKey('testkey!@#&^')).toBe(false);
    });
  });

  describe('getTranslation function', () => {
    it('returns the enum translation value if it exists in the uilocale object', () => {
      setupUiLocaleMock(enumMock);
      expect(getEnumTranslation('red', 'favoriteColor')).toBe('en Red');
      expect(getEnumTranslation('red', 'favoriteColor')).toBe('en Red');
      expect(getEnumTranslation('apple', 'favoriteFruit')).toBe('en Apple');
    });

    it('returns the override translation if enum translation does not exist but override does', () => {
      setupUiLocaleMock(enumMockWithOverrides);
      expect(getEnumTranslation('yellow', 'myColor')).toBe('en Yellow');
      expect(getEnumTranslation('black', 'myFruit')).toBe('en Black');
    });

    it('returns the original key if translation does not exist in either enum or overrides', () => {
      setupUiLocaleMock(enumMock);
      expect(getEnumTranslation('red', 'myColor')).toBe('red');
      expect(getEnumTranslation('apple', 'myFruit')).toBe('apple');
    });
  });

  describe('getEnumTranslation function', () => {
    it('returns the translation value if it exists in the overrides object', () => {
      setupUiLocaleMock();
      expect(getTranslation('testkey')).toBe('test value');
    });

    it('returns the original value if translation does not exist', () => {
      setupUiLocaleMock();
      expect(getTranslation('badkey!@#&^')).toBe('badkey!@#&^');
    });

    it('removes non-alpha numeric characters for key lookup', () => {
      setupUiLocaleMock();
      expect(getTranslation('testkey_@#*$&^ ')).toBe('test value');
    });

    it('returns translated values for an array of strings', () => {
      setupUiLocaleMock();
      const testArray = [
        'testkey',
        'testkey2',
        'testkey3',
        'badkey',
      ];

      const expectedArray = [
        'test value',
        'test value 2',
        'test value 3',
        'badkey',
      ];

      expect(getTranslation(testArray)).toEqual(expectedArray);
    });

    it('returns translated values if the text is a translation key', () => {
      setupUiLocaleMock();
      expect(getTranslation('overrides.testkey')).toBe('test value');
    });
  });

  describe('getLocalizedString function', () => {
    it('returns empty string when no data is passed in', () => {
      setupUiLocaleMock();
      expect(getLocalizedString('')).toBe('');
      expect(getLocalizedString(null)).toBe('');
    });

    it('returns original data if passed in data is a string', () => {
      setupUiLocaleMock();
      expect(getLocalizedString('stringTest')).toBe('stringTest');
    });

    it('returns localized string when object has this locale', () => {
      setupUiLocaleMock();
      expect(getLocalizedString({ en: 'object' }, 'en')).toBe('object');
    });

    it('returns fallback localized string when no matching locale in object, but there is a fallback', () => {
      setupUiLocaleMock();
      expect(getLocalizedString({ en: 'enObject', de: 'deObject' }, 'fr', 'de')).toBe('deObject');
    });

    it('returns fallback localized string when no matching locale in object, but there is an array of fallbacks', () => {
      setupUiLocaleMock();
      expect(getLocalizedString({ en: 'enObject', de: 'deObject' }, 'fr', ['es', 'de'])).toBe('deObject');
    });

    it('returns first string in object if none of the locales match', () => {
      setupUiLocaleMock();
      expect(getLocalizedString({ en: 'enObject', de: 'deObject' }, 'fr', ['es', 'ds'])).toBe('enObject');
    });
  });
});
