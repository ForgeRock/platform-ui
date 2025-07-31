/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';

const uilocaleEndpoint = '/config/uilocale';

/**
 * Retrieves uilocale translation override files
 * @param {String} locale Two letter locale to retrieve
 * @param {String} packageNames comma-separated list of packages to obtain the overrides for
 * @returns translation override files
 */
export function getTranslationOverrideByLocale(locale, packageNames = 'shared') {
  return generateIdmApi(null, false).get(`${uilocaleEndpoint}/${locale}?_fields=${packageNames}`);
}

/**
 * Retrieves all uilocale translation override files on tenant
 * @param {String} packageNames comma-separated list of packages to obtain the overrides for
 * @returns translation override files
 */
export function getAllTranslationOverrides(packageNames = 'shared', params = {}) {
  const encodedParams = encodeQueryString({
    _queryFilter: '_id sw "uilocale" ',
    _sortKeys: '_id',
    _fields: packageNames,
    ...params,
  });
  return generateIdmApi().get(`${uilocaleEndpoint}${encodedParams}`);
}

/**
 * Creates a uilocale override file
 * @param {String} locale Two letter locale to create
 * @param {Object} payload The overrides to add
 */
export function createOverride(locale, payload) {
  return generateIdmApi().put(`${uilocaleEndpoint}/${locale}`, payload);
}

/**
 * Updates a uilocale override file
 * @param {String} locale Two letter locale to update
 * @param {Array} payload The overrides to update
 */
export function updateOverride(locale, payload) {
  return generateIdmApi().patch(`${uilocaleEndpoint}/${locale}`, payload);
}
