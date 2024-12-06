/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const requestFormsUrl = '/governance/requestForms';

/**
* Get a request form by id
* @param {string} id id of the request form to get
* @returns The response is a promise that resolves to the form.
*/
// eslint-disable-next-line import/prefer-default-export
export function getRequestForm(id) {
  return generateIgaApi().get(`${requestFormsUrl}/${id}`);
}

/**
 * Get list of governance forms
 * @param {object} params query parameters passed to the backend
 * @returns The response is a promise that resolves to the data (including list of forms) returned by the API.
 */
export function getFormList(params = { _pageSize: 10 }, queryFilter = true) {
  return generateIgaApi().get(`${requestFormsUrl}${encodeQueryString({ ...params, queryFilter })}`);
}

/**
 * Create a new governance form
 * @param {object} form form to create
 * @returns The response is a promise that resolves to the created a form.
 */
export function createForm(form) {
  const params = { _action: 'create' };
  return generateIgaApi().post(`${requestFormsUrl}${encodeQueryString(params)}`, form);
}

/**
 * Delete a form
 * @param {string} formId form id to delete
 */
export function deleteForm(formId) {
  return generateIgaApi().delete(`${requestFormsUrl}/${formId}`);
}

/**
 * update a new governance form
 * @param {object} form form to update
 * @returns The response is a promise that resolves to the updated form.
 */
export function saveForm(form) {
  return generateIgaApi().put(`${requestFormsUrl}/${form.id}`, form);
}

/**
 * Patch a form
 * @param {string} formId form id to patch
 * @param {object} payload form data to patch
 * @returns The response is a promise that resolves to the patched form.
 */
export function patchForm(formId, payload) {
  return generateIgaApi().patch(`${requestFormsUrl}/${formId}`, payload);
}
