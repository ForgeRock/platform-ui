/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getRules } from './validationRules';
import i18n from '../i18n';

describe('validation Rules', () => {
  it('should validate numeric single value', () => {
    const { numeric } = getRules(i18n);
    expect(numeric('123')).toBe(true);
    expect(numeric(123)).toBe(true);
    expect(numeric('a')).toBe('Value must be of type integer.');
  });

  it('should validate numeric multi value', () => {
    const { numeric } = getRules(i18n);
    expect(numeric(['1', '2', '3'])).toBe(true);
    expect(numeric([1, 2, 3])).toBe(true);
    expect(numeric([1, '2', 3])).toBe(true);
    expect(numeric([123, 'a'])).toBe('Value must be of type integer.');
  });
});
