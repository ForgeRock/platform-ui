/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { pluralizeValue, pluralizeAnyString } from './PluralizeUtils';
import i18n from '@/i18n';

describe('PluralizeUtils', () => {
  beforeEach(() => {
    i18n.global.locale = 'en-GB';
  });

  afterEach(() => {
    i18n.global.locale = 'en-GB';
  });

  it('Pluralizes singular words', () => {
    expect(pluralizeValue('test')).toBe('tests');
  });

  it('Pluralizes index to indices', () => {
    expect(pluralizeValue('index')).toBe('indices');
  });

  it('Does not pluralize words that are already plural', () => {
    expect(pluralizeValue('Users')).toBe('Users');
  });

  it('Pluralizes numbers', () => {
    expect(pluralizeValue('123') === '123s' || pluralizeValue('123') === '123S').toBe(true);
  });

  it('Pluralizes sentences', () => {
    expect(pluralizeValue('This is a sentence')).toBe('This is a sentences');
  });

  it('Pluralizes spaces', () => {
    expect(pluralizeValue(' ') === ' s' || pluralizeValue(' ') === ' S').toBe(true);
  });

  it('Pluralizes characters', () => {
    expect(pluralizeValue('*#()Q&#@$') === '*#()Q&#@$s' || pluralizeValue('*#()Q&#@$') === '*#()Q&#@$S').toBe(true);
  });

  it('Pluralizes Captial words and appends a capital S', () => {
    expect(pluralizeValue('USER')).toBe('USERS');
  });

  it('Does not pluralize if i18n locale is not english', () => {
    i18n.global.locale = 'fr';
    expect(pluralizeValue('test')).toBe('test');
  });

  it('Pluralizes any string value', () => {
    expect(pluralizeAnyString('alpha_user')).toBe('alpha_users');
  });
});
