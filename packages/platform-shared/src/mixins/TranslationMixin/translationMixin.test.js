/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import TranslationMixin from './index';
import * as i18n from '@/i18n';

let wrapper;

describe('TranslationMixin', () => {
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

    wrapper = shallowMount({}, {
      render() {},
      global: {
        mixins: [TranslationMixin],
        plugins: [i18n],
      },
    });
  });

  describe('translationExists method', () => {
    it('returns true if a translation exists at the path', () => {
      expect(wrapper.vm.translationExists('overrides.testkey')).toBe(true);
    });
    it('returns false if a translation does not exist at the path', () => {
      expect(wrapper.vm.translationExists('badkey')).toBe(false);
    });
  });

  describe('toTranslationKey method', () => {
    it('removes all non alpha numeric characters from a string', () => {
      const text = 'test123!@#$%^&*()-=+[]{};:" <>,./?|`~*\\_';
      expect(wrapper.vm.toTranslationKey(text)).toEqual('test123');
    });
  });

  describe('getTranslation method', () => {
    it('returns the translation value if it exists in the overrides object', () => {
      expect(wrapper.vm.getTranslation('testkey')).toBe('test value');
    });

    it('returns the original value if translation does not exist', () => {
      expect(wrapper.vm.getTranslation('badkey!@#&^')).toBe('badkey!@#&^');
    });

    it('removes non-alpha numeric characters for key lookup', () => {
      expect(wrapper.vm.getTranslation('testkey_@#*$&^ ')).toBe('test value');
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

      expect(wrapper.vm.getTranslation(testArray)).toEqual(expectedArray);
    });
  });

  describe('getLocalizedString method', () => {
    it('returns empty string when no data is passed in', () => {
      expect(wrapper.vm.getLocalizedString('')).toBe('');
      expect(wrapper.vm.getLocalizedString(null)).toBe('');
    });

    it('returns original data if passed in data is a string', () => {
      expect(wrapper.vm.getLocalizedString('stringTest')).toBe('stringTest');
    });

    it('returns localized string when object has this locale', () => {
      expect(wrapper.vm.getLocalizedString({ en: 'object' }, 'en')).toBe('object');
    });

    it('returns fallback localized string when no matching locale in object, but there is a fallback', () => {
      expect(wrapper.vm.getLocalizedString({ en: 'enObject', de: 'deObject' }, 'fr', 'de')).toBe('deObject');
    });

    it('returns fallback localized string when no matching locale in object, but there is an array of fallbacks', () => {
      expect(wrapper.vm.getLocalizedString({ en: 'enObject', de: 'deObject' }, 'fr', ['es', 'de'])).toBe('deObject');
    });

    it('returns first string in object if none of the locales match', () => {
      expect(wrapper.vm.getLocalizedString({ en: 'enObject', de: 'deObject' }, 'fr', ['es', 'ds'])).toBe('enObject');
    });
  });
});
