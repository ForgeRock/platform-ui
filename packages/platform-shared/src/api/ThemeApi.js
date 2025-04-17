/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Theme API for retrieving and saving theme data.
 */

import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '../utils/encodeQueryString';

const themeRealmEndpoint = '/config/ui/themerealm';
const singleThemeEndpoint = '/ui/theme/';

/**
 * Returns all themes on all realms in the teanant
 * @returns {Promise} A promise that resolves with the themes
 */
export function getThemerealm() {
  return generateIdmApi({ timeout: 150000 }).get(themeRealmEndpoint);
}

/**
 * Returns theme(s) matching the provided realm and the provided query params
 * @param {Object} params The query parameters to filter the themes
 * @returns {Promise} A promise that resolves with the themes
 */
export function getThemes(params = {}) {
  return generateIdmApi({ headers: { 'x-requested-with': 'XMLHttpRequest' }, timeout: 150000 }).get(`${singleThemeEndpoint}${encodeQueryString(params, false)}`);
}

/**
 * Saves all themes on all realms in the tenant
 * @param {Object} themeRealmPayload Object containing all themes data to save
 * @returns {Promise} A promise that resolves with the saved themes
 */
export function saveThemes(themeRealmPayload) {
  return generateIdmApi().put(themeRealmEndpoint, themeRealmPayload);
}
