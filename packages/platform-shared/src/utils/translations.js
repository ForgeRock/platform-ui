/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import i18n from '@forgerock/platform-shared/src/i18n';

const overridePrefix = 'overrides';

/**
 * Checks if a translation value exists for a given path.
 * If a translation path does not exist in i18n, the path is returned
 *
 * @param {String} path path to check for a translation key
 * @returns {Boolean} if the key exists
 */
export function translationExists(path) {
  return i18n.global.t(path) !== path;
}
/**
 * Remove non alphanumeric characters from string
 * to get a valid i18n translation key
 *
 * @param {String} text string to convert to i18n key
 * @returns {String} text with all non-alphanumeric characters removed
 */
export function toTranslationKey(text) {
  const key = text.replace(/[\W_]/g, '');
  return key;
}
/**
  * Get the string value from the provided locale or fallback if provided
  * @param {string|object} data object containing locale codes or just a string
  * @param {string} locale i18n stored locale string
  * @param {string|string[]} fallbackLocale i18n stored fallback string or array of strings
  * @returns {string} localized string
  */
export function getLocalizedString(data, locale, fallbackLocale) {
  if (!data) {
    return '';
  }

  // No localization
  if (typeof data === 'string') {
    return data;
  }

  // We have a locale and the locale is part of the object
  if (locale && Object.keys(data).includes(locale)) {
    return data[locale];
  }

  // We have a fallbackLocale and that locale is a string, and is part of the object
  if (fallbackLocale
        && !Array.isArray(fallbackLocale)
        && Object.keys(data).includes(fallbackLocale)) {
    return data[fallbackLocale];
  }

  // We have a fallbackLocale and that locale is an array, and is part of the object
  if (fallbackLocale
        && Array.isArray(fallbackLocale)) {
    const arrayLocale = fallbackLocale.find((item) => Object.keys(data).includes(item));
    if (arrayLocale) {
      return data[arrayLocale];
    }
  }

  // Finally... just use the first index
  return data[Object.keys(data)[0]];
}
/**
 * Attempt to get a translation for a given string.
 * If a translation exists, return that. Else return the string.
 * Non-alphanumeric characters are removed
 *
 * @param {String|String[]} text text to attempt to translate
 * @returns {String|String[]} translated text if found, original text if not
 */
export function getTranslation(text) {
  try {
    if (!text) {
      return text;
    }

    // handle an array of strings
    if (Array.isArray(text)) {
      return text.map((x) => (getTranslation(x)));
    }

    // append the translationPrefix because overrides are not stored at the root level
    const key = `${overridePrefix}.${toTranslationKey(text)}`;
    if (translationExists(key)) {
      return i18n.global.t(key);
    }
    // return the unaltered text parameter if no translation is found
    return text;
  } catch (e) {
    return text;
  }
}
