/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const applicationUrl = 'governance/application';

/**
 * Fetches the list of applications based on the provided resource and query parameters.
 *
 * @param {Object} [queryParams={}] - An optional object containing query parameters to filter the application list.
 * @returns {Promise} - A promise that resolves to the list of applications.
 */
export function getApplications(resource, queryParams = {}) {
  const { disconnected, ...restParams } = queryParams;
  const encodedQueryParams = encodeQueryString(restParams);
  const disconnectedParam = disconnected !== undefined ? `${encodedQueryParams ? '&' : '?'}disconnected=${disconnected}` : '';
  return generateIgaApi().get(`${applicationUrl}${encodedQueryParams}${disconnectedParam}`);
}

/**
 * Fetches a single application by its ID.
 *
 * @param {string} id - The application ID.
 * @returns {Promise} - A promise that resolves to the application.
 */
export function getApplication(id, queryParams = {}) {
  const { disconnected, ...restParams } = queryParams;
  const encodedQueryParams = encodeQueryString(restParams);
  const disconnectedParam = disconnected !== undefined ? `${encodedQueryParams ? '&' : '?'}disconnected=${disconnected}` : '';
  return generateIgaApi().get(`${applicationUrl}/${id}${encodedQueryParams}${disconnectedParam}`);
}

/**
 * Creates a new unmanaged (disconnected) application.
 *
 * @param {Object} payload - Application fields (name, description, owners, icon, etc.)
 * @returns {Promise} - A promise that resolves to the created application.
 */
export function createUnmanagedApplication(payload) {
  return generateIgaApi().post(`${applicationUrl}?_action=create`, {
    ...payload,
    datasourceId: 'disconnected',
    isDisconnected: true,
  });
}

/**
 * Updates an unmanaged application by its ID.
 *
 * @param {string} id - The application ID.
 * @param {Object} payload - The updated application fields.
 * @returns {Promise} - A promise that resolves to the updated application.
 */
export function updateApplication(id, payload) {
  return generateIgaApi().put(`${applicationUrl}/${id}`, payload);
}

/**
 * Deletes an unmanaged application by its ID.
 *
 * @param {string} id - The application ID.
 * @returns {Promise} - A promise that resolves when the application is deleted.
 */
export function deleteUnmanagedApplication(id) {
  return generateIgaApi().delete(`${applicationUrl}/${id}`);
}

/**
 * Fetches the list of import files for a given application.
 *
 * @param {string} applicationId - The application ID.
 * @param {Object} [queryParams={}] - Optional query parameters.
 * @returns {Promise} - A promise that resolves to the list of files.
 */
export function getApplicationFiles(applicationId, queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${applicationUrl}/${applicationId}/files${encodedQueryParams}`);
}

/**
 * Fetches the list of accounts for a given application.
 *
 * @param {string} applicationId - The application ID.
 * @param {Object} [queryParams={}] - Optional query parameters.
 * @returns {Promise} - A promise that resolves to the list of accounts.
 */
export function getApplicationAccounts(applicationId, queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${applicationUrl}/${applicationId}/accounts${encodedQueryParams}`);
}

/**
 * Fetches the list of resources for a given application.
 *
 * @param {string} applicationId - The application ID.
 * @param {Object} [queryParams={}] - Optional query parameters.
 * @returns {Promise} - A promise that resolves to the list of resources.
 */
export function getApplicationResources(applicationId, queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${applicationUrl}/${applicationId}/resources${encodedQueryParams}`);
}

/**
 * Fetches a single object type for a given application.
 *
 * @param {string} applicationId - The application ID.
 * @param {string} objectTypeId - The object type ID.
 * @returns {Promise} - A promise that resolves to the object type.
 */
export function getObjectType(applicationId, objectTypeId) {
  return generateIgaApi().get(`${applicationUrl}/${applicationId}/objectType/${objectTypeId}`);
}

/**
 * Creates a new object type for a given application.
 *
 * @param {string} applicationId - The application ID.
 * @param {Object} payload - The object type fields.
 * @returns {Promise} - A promise that resolves to the created object type.
 */
export function createObjectType(applicationId, payload) {
  return generateIgaApi().post(`${applicationUrl}/${applicationId}/objectType?_action=create`, payload);
}

/**
 * Updates an object type for a given application.
 *
 * @param {string} applicationId - The application ID.
 * @param {string} objectTypeId - The object type ID.
 * @param {Object} payload - The updated object type fields.
 * @returns {Promise} - A promise that resolves to the updated object type.
 */
export function updateObjectType(applicationId, objectTypeId, payload) {
  return generateIgaApi().put(`${applicationUrl}/${applicationId}/objectType/${objectTypeId}`, payload);
}

/**
 * Deletes an object type for a given application.
 *
 * @param {string} applicationId - The application ID.
 * @param {string} objectTypeId - The object type ID.
 * @returns {Promise} - A promise that resolves when the object type is deleted.
 */
export function deleteObjectType(applicationId, objectTypeId) {
  return generateIgaApi().delete(`${applicationUrl}/${applicationId}/objectType/${objectTypeId}`);
}

/**
 * Fetches upload failure records for a given application upload.
 *
 * @param {string} applicationId - The application ID.
 * @param {string} uploadId - The upload ID.
 * @param {object} queryParams - Optional query parameters (pagination, filters).
 * @returns {Promise} - A promise that resolves to the list of upload failures.
 */
export function getApplicationUploadFailures(applicationId, uploadId, queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${applicationUrl}/${applicationId}/upload/${uploadId}/failures${encodedQueryParams}`);
}

/**
 * Triggers delete detection for a given application object type based on a previous upload.
 *
 * @param {string} applicationId - The application ID.
 * @param {string} objectTypeId - The object type ID to run delete detection against.
 * @param {object} [options] - Optional parameters.
 * @param {string} [options.uploadId] - ID of the upload to use as the reference set.
 * @param {string} [options.uploadTime] - Timestamp of the upload to use as the reference set.
 * @param {boolean} [options.countOnly] - If true, only return the count of records to be deleted without deleting.
 * @returns {Promise} - A promise that resolves to the delete detection result.
 */
export function detectApplicationDeletes(applicationId, objectTypeId, { uploadId, uploadTime, countOnly } = {}) {
  const payload = {};
  if (uploadId !== undefined) payload.uploadId = uploadId;
  if (uploadTime !== undefined) payload.uploadTime = uploadTime;
  if (countOnly !== undefined) payload.countOnly = countOnly;
  return generateIgaApi().post(`${applicationUrl}/${applicationId}/objectType/${objectTypeId}?_action=detectDeletes`, payload);
}

/**
 * Fetches a task by name for a given application.
 *
 * @param {string} applicationId - The application ID.
 * @param {string} name - The task name.
 * @returns {Promise} - A promise that resolves to the task object.
 */
export function getApplicationTask(applicationId, name) {
  return generateIgaApi().get(`${applicationUrl}/${applicationId}/task/${encodeURIComponent(name)}`);
}

/**
 * Upserts an application task by name (create or update).
 *
 * @param {string} applicationId - The application ID.
 * @param {Object} payload - The task payload.
 * @returns {Promise} - A promise that resolves to the saved task object.
 */
export function saveApplicationTask(applicationId, payload) {
  return generateIgaApi().post(`${applicationUrl}/${applicationId}/task?_action=create`, payload);
}

/**
 * Triggers immediate execution of a named task.
 *
 * @param {string} applicationId - The application ID.
 * @param {string} name - The task name.
 * @param {boolean} [preserveDate=true] - Whether to preserve the existing scheduled date.
 * @returns {Promise} - A promise that resolves when the trigger is accepted.
 */
export function triggerApplicationTask(applicationId, name, preserveDate = true) {
  return generateIgaApi().post(`${applicationUrl}/${applicationId}/task/${encodeURIComponent(name)}?_action=trigger${preserveDate ? '&preserveDate=true' : ''}`);
}

/**
 * Deletes a named task for a given application.
 *
 * @param {string} applicationId - The application ID.
 * @param {string} name - The task name.
 * @returns {Promise} - A promise that resolves when the task is deleted.
 */
export function deleteApplicationTask(applicationId, name) {
  return generateIgaApi().delete(`${applicationUrl}/${applicationId}/task/${encodeURIComponent(name)}`);
}

/**
 * Fetches the schema for a given object type within an application.
 *
 * @param {string} applicationId - The application identifier.
 * @param {string} objectType - The object type to retrieve the schema for.
 * @returns {Promise} - A promise that resolves to the object type schema.
 */
export function getObjectTypeSchema(applicationId, objectType) {
  return generateIgaApi().get(`${applicationUrl}/${applicationId}/${objectType}/schema`);
}

/**
 * Uploads a CSV file of application data for a given application.
 *
 * @param {string} applicationId - The application ID.
 * @param {File} file - The CSV file to upload.
 * @param {string} objectType - The object type the data belongs to (e.g. 'User', 'Role').
 * @param {boolean} [isDeletion=false] - If true, the upload is treated as a deletion operation.
 * @param {boolean} [useIgaId=false] - If true, ID values in the CSV are IGA IDs rather than source system IDs.
 * @returns {Promise} - A promise that resolves when the upload completes.
 */
export function uploadApplicationData(applicationId, file, objectType, isDeletion = false, useIgaId = false) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('objectType', objectType);
  let params = '?_action=upload';
  if (isDeletion) {
    params += useIgaId ? '&type=delete&deleteOption=iga' : '&type=delete&deleteOption=source';
  }
  return generateIgaApi().post(`${applicationUrl}/${applicationId}${params}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
