/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { has, get } from 'lodash';
import TranslationMixin from './index';

let wrapper;
const translations = {
  overrides: {
    testkey: 'test value',
    testkey2: 'test value 2',
    testkey3: 'test value 3',
  },
};

describe('TranslationMixin', () => {
  beforeEach(() => {
    wrapper = shallowMount({}, {
      render() {},
      mixins: [TranslationMixin],
      mocks: {
        $t: (id) => {
          if (has(translations, id)) {
            return get(translations, id);
          }
          return id;
        },
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
});
