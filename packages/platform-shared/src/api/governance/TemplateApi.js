/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const governanceBaseUrl = '/governance';
const governanceTemplateBaseUrl = `${governanceBaseUrl}/certification/template`;
const governanceCertificationBaseUrl = `${governanceBaseUrl}/certification`;

/**
 * It returns a promise that resolves to an array of objects
 * @param queryString - The query string to search for templates.
 * @returns A promise
 */
export function getTemplates(queryString) {
  if (queryString?.length) return generateIgaApi().get(`${governanceTemplateBaseUrl}?queryString=${queryString}`);
  return generateIgaApi().get(governanceTemplateBaseUrl);
}

/**
 * This function will make a POST request to the IGA API with the payload provided
 * @param payload - The payload is the data that you want to send to the server.
 * @returns A promise
 */
export function postTemplate(payload) {
  return generateIgaApi().post(governanceTemplateBaseUrl, payload);
}

/**
 * It updates a template.
 * @param id - The id of the template you want to update.
 * @param payload - The data to be sent to the server.
 * @returns A promise
 */
export function updateTemplate(id, payload) {
  return generateIgaApi().put(`${governanceTemplateBaseUrl}/${id}`, payload);
}

/**
 * This function is used to get the count of the decisions that are made by the user
 * @param {Object} filter - The filter object that is passed to the API.
 * @param {String[]} grantTypes - grants associated with filter (accountGrant, entitlementGrant, etc)
 * @param {Object[]} params - query parameters
 * @returns The number of decisions that match the filter.
 */
export function getDecisionCount(filter, grantTypes, params) {
  const queryString = encodeQueryString(params, false);
  filter.type = grantTypes;

  return generateIgaApi().post(`${governanceCertificationBaseUrl}/target-count${queryString}`, filter);
}

/**
 * Deletes a governance certification template
 * param {String} id certification template id instead? The first Id should at least be lowercase to match the parameter name
 *
 * @returns {Promise}
 */
export function deleteTemplate(id) {
  return generateIgaApi().delete(`${governanceTemplateBaseUrl}/${id}`);
}

/**
 * Duplicates a certification template
 * @param {String} Id certification template template_id
 *
 * @returns {Promise}
 */
export function duplicateTemplate(id) {
  return generateIgaApi().post(`${governanceTemplateBaseUrl}/${id}/duplicate`);
}

/**
* Returns the list of certification templates
*
* @param {object} params - Optional parameters to be plugged into query string
* {
*   queryFilter: String,
*   sortBy: String,
*   pageSize: String,
* }
 * @returns {Promise}
*/
export function getTemplateList(params) {
  const queryParams = new URLSearchParams(params).toString();
  const resourceUrl = `${governanceTemplateBaseUrl}?${queryParams}`;
  return generateIgaApi().get(resourceUrl);
}

/**
 * Publish a certification template
 * @param {String} Id certification template template_id
 *
 * @returns {Promise}
 */
export function runPublishedTemplate(params) {
  const resourceUrl = `${governanceCertificationBaseUrl}`;
  return generateIgaApi().post(resourceUrl, params);
}

/**
 * Update the schedule template
 * @param {String} Id certification template template_id
 *
 * @returns {Promise}
 */
export function patchScheduleTemplate(templateId, data) {
  const resourceUrl = `${governanceTemplateBaseUrl}/${templateId}/schedule`;
  return generateIgaApi().patch(resourceUrl, data);
}
