/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import pluralize from 'pluralize';
import i18n from '@/i18n';

/**
 * The pluralize library only supports english, so we should
 * only use it when the user is accessing the UI with that language
 */
function canUsePluralizeLib() {
  const isVuei18nLocaleEnBased = i18n?.global?.locale?.startsWith('en') || false;
  return isVuei18nLocaleEnBased;
}

/**
 * Pluralizes the given value if the pluralize library can be used.
 *
 * @param {string} value - The value to be pluralized.
 * @returns {string} - The pluralized value or the original value if the library cannot be used.
 */
export function pluralizeValue(value) {
  if (canUsePluralizeLib()) {
    return pluralize(value);
  }
  return value;
}

/**
 * Converts the given value to its singular form if the pluralize library can be used.
 *
 * @param {string} value - The value to be converted to singular.
 * @returns {string} - The singular form of the value or the original value if the library cannot be used.
 */
export function pluralizeSingular(value) {
  if (canUsePluralizeLib()) {
    return pluralize.singular(value);
  }
  return value;
}

/**
 * Pluralizes any given string.
 *
 * @param {string} value - The string to be pluralized.
 * @returns {string} - The pluralized string.
 */
export function pluralizeAnyString(value) {
  return value ? pluralize(value) : '';
}
