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

import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';

const themeRealmEndpoint = '/config/ui/themerealm';

/**
 * Returns all themes on all realms in the teanant
 * @returns {Promise} A promise that resolves with the themes
 */
export function getThemes() {
  return generateIdmApi({ timeout: 150000 }).get(`${themeRealmEndpoint}`);
}

/**
 * Saves all themes on all realms in the tenant
 * @param {Object} themeRealmPayload Object containing all themes data to save
 * @returns {Promise} A promise that resolves with the saved themes
 */
export function saveThemes(themeRealmPayload) {
  return generateIdmApi().put(`${themeRealmEndpoint}`, themeRealmPayload);
}
