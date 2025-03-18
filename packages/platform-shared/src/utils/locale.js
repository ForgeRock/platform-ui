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
* @prop {Array} existingLocales Pre-defined locales to select from
* @returns {String} default locale string
*/
export default function getDefaultLocale(existingLocales = []) {
  const { locale: primaryLocale, fallbackLocale } = i18n.global;

  if (!existingLocales?.length) {
    return '';
  }

  // Primary locale found in provided array
  if (existingLocales.includes(primaryLocale)) {
    return primaryLocale;
  }

  // Fallback locale exists and isn't an array so it's assumed to be a string and passed into the `includes` method
  if (fallbackLocale && !Array.isArray(fallbackLocale) && existingLocales.includes(fallbackLocale)) {
    return fallbackLocale;
  }

  // Fallback locale is an array, so we check each index with `find`
  if (Array.isArray(fallbackLocale)) {
    const foundLocale = fallbackLocale.find((locale) => existingLocales.includes(locale));
    if (foundLocale) {
      return foundLocale;
    }
  }

  // No matching locale found so we use the first index
  // This is not ideal and needs to match what AM provides as a final fallback,
  // this will need to change after confirmation with AM on how to handle
  return existingLocales[0];
}

/**
 * Takes a single locale string and returns an array of the original locale and it's territiory value.
 * Used to ensure we have a fallback locale if the string provided contains a territory.
 * e.g., ['en-US', 'en']
 *
 * @param {String} locale - a locale
 * @returns {Array} array containing the original locale and it's root territory - if the provided locale contains a territory
 */
function getLocales(locale) {
  if (!locale) {
    return [];
  }
  const locales = [];
  locales.push(locale);
  if (locale.includes('-')) {
    const localeSplit = locale.split('-');
    locales.push(localeSplit[0]);
  }

  return locales;
}

/**
 * Get locales from all sources in order of priority.
 * First index will be the primary locale. The rest will be fallback locales.
 *
 * Priority:
 *   1) Query String (checkQueryString === true)
 *   2) Browser `Accept-Languages` via `navigator.languages`
 *   3) IDM UI Config API (`lang` and/or `defaultLocale` fields)
 *   4) English `en` - This will ALWAYS be set in the return value. If the value
 *      doesn't come from above, then it will be the final fallback
 *
 * @param {Object} uiConfig - config data result from IDM config API reponse
 * @param {Boolean} checkQueryString - should we check if the browser query string contains `locale`
 * @returns {Array} Array of locales, in order of priority
 *
 */
export function getAllLocales(uiConfig, checkQueryString = false) {
  const locales = [];
  let localeQueryString;

  // Check for locale query parameter
  if (checkQueryString) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    localeQueryString = urlSearchParams.get('locale');
    locales.push(...getLocales(localeQueryString));
  }

  // Accept-Language header
  if (navigator.languages?.length) {
    navigator.languages.forEach((lang) => {
      locales.push(...getLocales(lang));
    });
  } else {
    // IDM lang
    if (uiConfig.lang) {
      // This is needed because IDM lowercases the territory values in the locale (e.g., en-US becomes en-us) it gets in the Accept-Language header.
      const idmLocale = uiConfig.lang.replace(/[-]([A-Za-z]+)?(?=-|$)/g, (found) => found.toUpperCase());
      locales.push(...getLocales(idmLocale));
    }

    // IDM defaultLocale
    if (uiConfig.defaultLocale) {
      // This is needed because IDM lowercases the territory values in the locale (e.g., en-US becomes en-us) it gets in the Accept-Language header.
      const idmLocale = uiConfig.defaultLocale.replace(/[-]([A-Za-z]+)?(?=-|$)/g, (found) => found.toUpperCase());
      locales.push(...getLocales(idmLocale));
    }
  }

  // Hardcoded English
  if (!locales.includes('en')) {
    locales.push('en');
  }

  // Removed duplicates
  const filteredLocales = locales.filter((value, index) => locales.indexOf(value) === index);
  return { locales: filteredLocales, ...(checkQueryString && { localeQueryString }) };
}
