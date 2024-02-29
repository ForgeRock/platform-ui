/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import { merge } from 'lodash';

/**
 * Given an array of locales, return an array with those locales and fallbacks
 * e.g. ['fr-ca' ,'en-us'] will return ['fr-ca', 'fr', 'en-us', 'en']
 *
 * @param {String[]} locales array of locales in order of importance
 * @returns {String[]} languages array with general fallbacks inserted in order
 */
function getFallbacks(locales) {
  const fallbackArray = [];

  // add spefic locales as well as general versions
  locales.forEach((locale) => {
    fallbackArray.push(locale);
    const splitLocale = locale.split('-');
    if (splitLocale.length > 1) {
      fallbackArray.push(splitLocale[0]);
    }
  });
  return fallbackArray;
}

/**
 * Set locale and fallback locale for a given i18n instance. This function accounts
 * for general fallbacks for specific locales as well as a finalFallback locale which will
 * be set as the final fallback if not present elsewhere
 *
 * @param {Object} i18n i18n instance
 * @param {String} localeString comma separated string representing all locales
 * @param {String} finalFallback a final fallback locale to be added if not present in localeString
 */
export function setLocales(i18n, localeString, finalFallback) {
  if (!localeString.length || !i18n) {
    return;
  }

  let locales = localeString.split(',');
  locales = getFallbacks(locales);

  // first locale is the primary locale
  i18n.global.locale = locales.shift();

  if (locales.length) {
    // fallback locale must contain a default
    if (finalFallback && i18n.global.locale !== finalFallback && !locales.includes(finalFallback)) locales.push(finalFallback);
    i18n.global.fallbackLocale = locales;
  }
}

/**
 * Merge message overrides into the provided i18n instance
 *
 * @param {Object} i18n i18n instance
 * @param {String} locale locale to apply overrides to
 * @param {Object} overrides message overrides
 */
function mergeMessages(i18n, locale, overrides) {
  const { messages } = i18n.global;
  const combined = merge(messages[locale], overrides);
  i18n.global.setLocaleMessage(locale, combined);
}

/**
 * Get translation overrides from IDM config for the specified locale.
 * Will get overrides for packageName as well as shared
 *
 * @param {String} idmContext IDM base url
 * @param {String} locale locale to get overrides for
 * @param {String} packageName the package to override translations in (enduser, login)
 * @returns promise containing message override information if present, and an empty object if not.
 */
function getTranslationOverridesForLocale(idmContext, locale, packageName) {
  return new Promise((resolve) => {
    const idmInstance = axios.create({
      baseURL: idmContext,
      headers: {},
    });

    idmInstance.get(`/config/uilocale/${locale}?_fields=${packageName},shared`).then((res) => {
      delete res.data._id;
      resolve({ locale, messages: res.data });
    },
    () => {
      // no tranlsation overrides found
      resolve({ locale, messages: {} });
    });
  });
}

/**
 * Get translation overrides from IDM config for main locale and fallback locale
 *
 * @param {String} idmContext IDM base url
 * @param {String} locale main locale to get overrides for
 * @param {String[]} fallbackLocales array of fallback locales to get overrides for
 * @param {String} packageName the package to override translations in (enduser, login)
 * @returns promise containing message override information for main locale and fallback locale
 */
function getTranslationOverrides(idmContext, locale, fallbackLocales, packageName) {
  return new Promise((resolve) => {
    // get config translations for main locale
    const localePromise = getTranslationOverridesForLocale(idmContext, locale, packageName);

    const fallbackPromises = [];
    // get config translation for fallback locale
    fallbackLocales.forEach((fallbackLocale) => {
      fallbackPromises.push(getTranslationOverridesForLocale(idmContext, fallbackLocale, packageName));
    });

    // returns array of objects containing locale and messages retrieved from config
    Promise.all([localePromise, ...fallbackPromises]).then((res) => {
      const overrides = res.map((override) => ({ locale: override.locale, messages: override.messages }));
      resolve(overrides);
    });
  });
}

/**
 * In the provided i18n instance, override translation messages for the provided
 * package name and shared. This is done for both the main locale, and the fallback locale
 *
 * @param {String} idmContext IDM base url
 * @param {Object} i18n i18n instance
 * @param {String} packageName the package to override translations in (enduser, login)
 * @returns a resolved promise, after the translations have been overridden for main locale and fallback locale
 */
export function overrideTranslations(idmContext, i18n, packageName) {
  const { locale, fallbackLocale } = i18n.global;

  // i18n fallback locale can be an array of strings or a single string
  // we reconcile that here to make it simpler to handle
  const fallbackLocales = Array.isArray(fallbackLocale) ? fallbackLocale : [fallbackLocale];

  return new Promise((resolve) => {
    getTranslationOverrides(idmContext, locale, fallbackLocales, packageName).then((res) => {
      // for each override, override the existing i18n messages
      res.forEach((override) => {
        if (override.messages.shared) mergeMessages(i18n, override.locale, override.messages.shared);
        if (override.messages[packageName]) mergeMessages(i18n, override.locale, override.messages[packageName]);
      });
      resolve();
    });
  });
}
