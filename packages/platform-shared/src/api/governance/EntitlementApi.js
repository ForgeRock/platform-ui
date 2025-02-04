/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const entitlementUrl = 'governance/entitlement';

/**
 * Get a list of entitlements.
 *
 * @param {Object} queryParams - The query parameters to include in the request.
 * @returns {Promise} - A promise that resolves to a list of entitlements.
 */
export async function getEntitlementList(resource, queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${entitlementUrl}${encodedQueryParams}`);
}

/**
 * Get entitlement details for a single entitlement by ID.
 *
 * @param {string} id - The ID of the entitlement to retrieve.
 * @returns {Promise} A promise that resolves to the entitlement details.
 */
export function getEntitlementById(id) {
  return generateIgaApi().get(`${entitlementUrl}/${id}`);
}

/**
 * Get the users assigned to a specific entitlement.
 *
 * @param {string} id - The ID of the entitlement.
 * @param {Object} queryParams - Optional query parameters to include in the request.
 * @returns {Promise} - A promise that resolves to the entitlement users.
 */
export function getEntitlementUsers(id, queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${entitlementUrl}/${id}/assignments/users${encodedQueryParams}`);
}

/**
 * Fetches the entitlement schema for a given application and object type.
 *
 * @param {string} application - The name of the application.
 * @param {string} objectType - The type of the object.
 * @returns {Promise} A promise that resolves to the entitlement schema.
 */
export function getEntitlementSchema(application, objectType) {
  return generateIgaApi().get(`governance/application/${application}/${objectType}/schema`);
}
