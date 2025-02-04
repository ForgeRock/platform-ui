/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const glossaryUrl = '/commons/glossary/schema';

/**
 * Fetches glossary attributes based on the provided parameters.
 * @param {Object} params - The parameters to be encoded into the query string.
 * @returns {Promise} - A promise that resolves to the response of the API call.
 */
export function getGlossaryAttributes(params) {
  const queryParams = encodeQueryString(params, false);
  return generateIgaApi().get(`${glossaryUrl}${queryParams}`);
}

/**
 * Get List of Glossary attributes based on filter payload and query parameters
 * @param {object} data filter payload passed to the backend
 * @param {object} config query parameters passed to the backend
 * @returns The response is a promise that resolves to the data returned by the API.
 */
export function searchGlossaryAttributes({ data, config }) {
  return generateIgaApi().post(`${glossaryUrl}/search`, data, config);
}

/**
 * Create or Edit Glossary attribute with provided attribute details payload
 * @param {object} payload details of the attribute. ex: name, displayName, description, type, isMultiValue, enumeratedValues
 * @returns The response is a promise that resolves to the data returned by the API.
 */
export function saveGlossaryAttribute(payload) {
  if (payload.id) {
    return generateIgaApi().put(`${glossaryUrl}/${payload.id}`, payload);
  }
  return generateIgaApi().post(glossaryUrl, payload);
}

/**
 * Delete glossary attribute by its id
 * @param {string} id id of the attribute that needs to be deleted
 */
export function deleteGlossaryAttribute(id) {
  return generateIgaApi().delete(`${glossaryUrl}/${id}`);
}

/**
 * Create Glossary attribute values for an application with provided payload
 * @param {string} appId Application ID for which the glossary attribute values are saved
 * @param {object} payload Key value pair of the glossary attribute and value
 * @returns The response is a promise that resolves to the data returned by the API.
 */
export function saveGlossaryAttributesByAppId(appId, payload) {
  const glossaryAppUrl = `/governance/application/${appId}/glossary`;
  return generateIgaApi().post(glossaryAppUrl, payload);
}

/**
 * Edit Glossary attribute values for an application with provided payload
 * @param {string} appId Application ID for which the glossary attribute values are saved
 * @param {object} payload Key value pair of the glossary attribute and value
 * @returns The response is a promise that resolves to the data returned by the API.
 */
export function updateGlossaryAttributesByAppId(appId, payload) {
  const glossaryAppUrl = `/governance/application/${appId}/glossary`;
  return generateIgaApi().put(glossaryAppUrl, payload);
}

/**
 * Query Glossary attribute values for an application
 * @param {string} appId Application ID for which the glossary attribute values are saved
 * @returns The response is a promise that resolves to the data returned by the API.
 */
export function getGlossaryAttributesByAppId(appId) {
  const glossaryAppUrl = `/governance/application/${appId}/glossary`;
  return generateIgaApi().get(glossaryAppUrl);
}
