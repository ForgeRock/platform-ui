/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from '@/i18n';

/**
 * Mocks validation rules for testing purposes.
 *
 * If specific rule names are provided in `mockRules`, only those rules are mocked and extended.
 * Otherwise, all available validation rules are extended.
 *
 * @param {string[]|null} [mockRules=null] - An array of rule names to mock, or null to mock all rules.
 * @returns {object} The ValidationRules object with the extended rules.
 */
// eslint-disable-next-line import/prefer-default-export
export function mockValidation(mockRules = null) {
  if (mockRules) {
    const rules = {};
    mockRules.forEach((rule) => {
      rules[rule] = ValidationRules.getRules(i18n)[rule];
    });
    ValidationRules.extendRules(rules);
    return ValidationRules;
  }

  const rules = ValidationRules.getRules(i18n);
  ValidationRules.extendRules(rules);

  return ValidationRules;
}
