/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const accountUrl = 'governance/account';

/**
 * Get a list of accounts.
 *
 * @param {Object} queryParams - The query parameters to include in the request.
 * @returns {Promise} - A promise that resolves to a list of accounts.
 */
export async function getAccounts(queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${accountUrl}${encodedQueryParams}`);
}

/**
 * Get account details for a single account by ID.
 *
 * @param {string} id - The ID of the account to retrieve.
 * @returns {Promise} A promise that resolves to the account details.
 */
export function getAccountById(id) {
  return generateIgaApi().get(`${accountUrl}/${id}`);
}

/**
 * Method to fetch data of glossary attributes for an account
 * @param {string} accountId
 */
export function getAccountGlossaryAttributesData(accountId) {
  return generateIgaApi().get(`${accountUrl}/${accountId}/glossary`);
}

/**
 * Method to save the account glossary attributes data
 * @param {string} accountId
 * @param {object} payload - Object with all data of glossary attributes
 */
export function saveAccountGlossaryAttributesData(accountId, payload) {
  return generateIgaApi().put(`${accountUrl}/${accountId}/glossary`, payload);
}

/**
 * Method to fetch data of glossary attributes for an account
 * @param {string} accountId
 * @param {Object} queryParams - The query parameters to include in the request
 */
export function getAccountEntitlements(accountId, queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${accountUrl}/${accountId}/entitlements${encodedQueryParams}`);
}
