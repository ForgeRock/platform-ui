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
} from './translations';
import * as i18n from '@/i18n';

describe('translation util', () => {
  beforeEach(() => {
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
    });
  });

  describe('translationExists method', () => {
    it('returns true if a translation exists at the path', () => {
      expect(translationExists('overrides.testkey')).toBe(true);
    });
    it('returns false if a translation does not exist at the path', () => {
      expect(translationExists('badkey')).toBe(false);
    });
  });

  describe('toTranslationKey method', () => {
    it('removes all non alpha numeric characters from a string', () => {
      const text = 'test123!@#$%^&*()-=+[]{};:" <>,./?|`~*\\_';
      expect(toTranslationKey(text)).toEqual('test123');
    });

    it('Handles text containing html without error', () => {
      const textWithHtml = 'Make this application an authoritative source of identity data. <a target="_blank" href="https://backstage.forgerock.com/docs/idcloud/latest/app-management/applications.html#target_and_authoritative_applications">Learn more</a>';
      const htmlTextWithSpecialCharactersAndSpacesRemoved = 'MakethisapplicationanauthoritativesourceofidentitydataatargetblankhrefhttpsbackstageforgerockcomdocsidcloudlatestappmanagementapplicationshtmltargetandauthoritativeapplicationsLearnmorea';
      expect(toTranslationKey(textWithHtml)).toEqual(htmlTextWithSpecialCharactersAndSpacesRemoved);
    });

    it('handles other languages with non-english characters', () => {
      const textWithNonEnglishCharacters = 'Hi! мир! 你好，世界! こんにちは@, 안녕하세요! 会话已超时 üéé';
      expect(toTranslationKey(textWithNonEnglishCharacters)).toEqual('Hiмир你好世界こんにちは안녕하세요会话已超时üéé');
    });
  });

  describe('isTranslationKey method', () => {
    it('returns true if the string is a valid translation key', () => {
      expect(isTranslationKey('test.key')).toBe(true);
    });

    it('returns false if the string is not a valid translation key', () => {
      expect(isTranslationKey('testkey!@#&^')).toBe(false);
    });
  });

  describe('getTranslation method', () => {
    it('returns the translation value if it exists in the overrides object', () => {
      expect(getTranslation('testkey')).toBe('test value');
    });

    it('returns the original value if translation does not exist', () => {
      expect(getTranslation('badkey!@#&^')).toBe('badkey!@#&^');
    });

    it('removes non-alpha numeric characters for key lookup', () => {
      expect(getTranslation('testkey_@#*$&^ ')).toBe('test value');
    });

    it('returns translated values for an array of strings', () => {
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
      expect(getTranslation('overrides.testkey')).toBe('test value');
    });
  });

  describe('getLocalizedString method', () => {
    it('returns empty string when no data is passed in', () => {
      expect(getLocalizedString('')).toBe('');
      expect(getLocalizedString(null)).toBe('');
    });

    it('returns original data if passed in data is a string', () => {
      expect(getLocalizedString('stringTest')).toBe('stringTest');
    });

    it('returns localized string when object has this locale', () => {
      expect(getLocalizedString({ en: 'object' }, 'en')).toBe('object');
    });

    it('returns fallback localized string when no matching locale in object, but there is a fallback', () => {
      expect(getLocalizedString({ en: 'enObject', de: 'deObject' }, 'fr', 'de')).toBe('deObject');
    });

    it('returns fallback localized string when no matching locale in object, but there is an array of fallbacks', () => {
      expect(getLocalizedString({ en: 'enObject', de: 'deObject' }, 'fr', ['es', 'de'])).toBe('deObject');
    });

    it('returns first string in object if none of the locales match', () => {
      expect(getLocalizedString({ en: 'enObject', de: 'deObject' }, 'fr', ['es', 'ds'])).toBe('enObject');
    });
  });
});
