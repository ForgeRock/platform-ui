/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Theme API for retrieving and saving theme data. Houses api requests for old way of
 * storing themes (themerealm) as well as the new way of storing themes (theme-*).
 */

import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';

const configEndpoint = '/config/';
const singleThemeEndpoint = '/config/';
const themeConfigEndpoint = '/config/ui/themeconfig';
const themeRealmEndpoint = '/config/ui/themerealm';

/**
 * Removes forward slash from realm
 * @param {String} realm the realm to convert
 * @returns Converted realm
 */
function convertRealm(realm) {
  let returnRealm = realm;
  if (realm === '/') {
    returnRealm = 'root';
  } else if (realm[0] === '/') {
    returnRealm = realm.slice(1);
  }
  return encodeURIComponent(returnRealm);
}

/**
  * Returns a single modern (non-legacy) theme
  * @param {String} realm the realm that the theme is located in
  * @param {String} themeId the id of the theme
  *
  * @returns {Promise}
  */
export function getRealmTheme(themeId) {
  return generateIdmApi().get(`${configEndpoint}${themeId}`);
}

/**
 * Returns all non-legacy themes for a given realm
 * @param {String} realm The realm that the themes are located in
 * @param {Array} fields Which fields are retrieved from the query for each theme
 * @returns {Promise} A promise that resolves with the themes
 */
export function getRealmThemes(realm = 'root', fields = '*') {
  const encodedRealm = convertRealm(realm);
  const queryFilter = `_id sw "ui/theme-${encodedRealm}"`;

  const queryString = encodeQueryString({ fields, queryFilter });
  return generateIdmApi({ timeout: 150000 }).get(`/config${queryString}`);
}

/**
 * Locates a single theme within the specified realm, searching by theme name
 * @param {String} realm The realm that the theme is located in
 * @param {String} themeName The name of the theme to search for
 * @returns {Promise} A promise that resolves with a single theme
 */
export function getRealmThemeByName(realm = 'root', themeName) {
  const encodedRealm = convertRealm(realm);
  const queryFilter = `_id sw "ui/theme-${encodedRealm}" and name eq "${themeName}"`;

  const queryString = encodeQueryString({ fields: '*', queryFilter });
  return generateIdmApi({ timeout: 150000 }).get(`/config${queryString}`);
}

/**
 * Returns all legacy themes on all realms in the teanant
 * @returns {Promise} A promise that resolves with the legacy themes
 */
export function getLegacyThemes() {
  return generateIdmApi({ timeout: 150000 }).get(`${themeRealmEndpoint}`);
}

/**
 * Retrieves the current theme metadata (containing the default theme and journey-theme links).
 * Designed for non-legacy themes.
 * @returns {Promise} A promise that resolves with the theme config
 */
export function getThemeMetadata() {
  return generateIdmApi().get(`${themeConfigEndpoint}`);
}

/**
 * Saves the theme config (containing the default theme and journey-theme links).
 * @param {Object} themeConfigPayload Entire theme config to save
 * @returns {Promise} A promise that resolves with the saved theme config
 */
export function saveThemeConfig(themeConfigPayload) {
  return generateIdmApi().put(`${themeConfigEndpoint}`, themeConfigPayload);
}

/**
 * Saves all legacy themes on all realms in the tenant
 * @param {Object} themeRealmPayload Object containing all legacy themes data to save
 * @returns {Promise} A promise that resolves with the saved legacy themes
 */
export function saveLegacyThemes(themeRealmPayload) {
  return generateIdmApi().put(`${themeRealmEndpoint}`, themeRealmPayload);
}

/**
 * Deletes all legacy themes on all realms in the tenant
 * @param {Object} themeRealmPayload Object containing all legacy themes data to save
 * @returns {Promise} A promise that resolves with the saved legacy themes
 */
export function deleteLegacyThemes() {
  return generateIdmApi().delete(`${themeRealmEndpoint}`);
}

/**
 * Deletes a non-legacy theme
 * @param {String} themeId id of the theme to delete
 * @returns {Promise} A promise that resolves with the deleted theme
 */
export function deleteRealmTheme(themeId) {
  return generateIdmApi().delete(`${configEndpoint}${themeId}`);
}

/**
  * Saves a non-legacy theme
  * @param {String} themeName the name of the theme
  * @param {Object} themeDataPayload the theme data to save
  * @returns {Promise}
  */
export function saveRealmTheme(themeId, themeDataPayload) {
  return generateIdmApi().put(`${singleThemeEndpoint}${themeId}`, themeDataPayload);
}
