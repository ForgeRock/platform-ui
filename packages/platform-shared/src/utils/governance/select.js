/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { compareRealmSpecificResourceName } from '@forgerock/platform-shared/src/utils/realm';
import i18n from '@/i18n';

/**
 * Generates an option object used for a select input.
 *
 * @param {Object} resource - The resource object.
 * @param {string} resource.name - The name of the resource.
 * @param {string|number} resource.id - The ID of the resource.
 * @returns {Object} An option object with text and value properties.
 */
export function getOption(resource) {
  return {
    text: resource.name,
    value: resource.id,
  };
}

/**
 * Parses the query string and returns an object containing the query parameters.
 *
 * @param {string} queryString - The query string to parse.
 * @param {string} resourceType - The type of the resource (e.g., 'application').
 * @returns {Object} - An object containing the query parameters as key-value pairs.
 */
export function getQueryParams(queryString, resourceType) {
  const queryParams = {};
  if (queryString) queryParams.queryString = queryString;
  if (resourceType === 'application') queryParams.authoritative = false;
  return queryParams;
}

/**
 * Returns the default option for a given resource and resource type when using the governance api.
 *
 * @param {Object} resource - The resource object containing details such as name and id.
 * @param {string} resourceType - The type of the resource (e.g., 'user').
 * @returns {Object} The default governance option object with properties:
 *   - text: The display text for the option.
 *   - userInfo: The user information (only if resourceType is 'user').
 *   - value: The unique identifier of the resource.
 */
export function getDefaultGovOption(resource, resourceType) {
  if (resourceType === 'user' || compareRealmSpecificResourceName(resourceType, 'user')) {
    return {
      text: i18n.global.t('common.userFullNameUserName', { givenName: resource.givenName, sn: resource.sn, userName: resource.userName }),
      userInfo: resource,
      value: resource.id,
    };
  }
  return {
    ...resource,
    text: resource.name,
    value: resource.id,
  };
}
