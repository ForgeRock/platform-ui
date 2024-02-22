/**
 * Copyright (c) 2022-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import i18n from '@/i18n';

/**
* Gets the default locale based on i18n, or the first locale within the passed in existing locales, or an empty string.
*
* @prop {array} existingLocales Pre-defined locales to select from
* @returns {string} default locale string
*/
export default function getDefaultLocale(existingLocales = []) {
  let allLocales = [];
  if (!Array.isArray(i18n.global.fallbackLocale)) {
    // Both locale and fallbackLocale are strings, so make an array with them
    allLocales.push(i18n.global.locale, i18n.global.fallbackLocale);
  } else {
    // fallbackLocale is an array, so we spread it with the string locale
    allLocales = [i18n.global.locale, ...i18n.global.fallbackLocale];
  }
  return allLocales.find((item) => existingLocales.includes(item)) || existingLocales[0] || '';
}
