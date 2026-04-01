/**
 * Copyright 2024-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateIgaOrchestrationApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const workflowUrl = '/orchestration/definition';

/**
 * Get list of workflows
 * @param {object} params query parameters passed to the backend
 * @returns The response is a promise that resolves to the data (including list of workflows) returned by the API.
 */
export function getWorkflowList(params = { _pageSize: 100 }) {
  return generateIgaOrchestrationApi().get(`${workflowUrl}${encodeQueryString(params, false)}`);
}

/**
 * Get single workflow based on passed in id and status
 * @param {string} id unique identifier of workflow to return
 * @param {string} status whether request is for draft or published version of workflow
 * @returns The response is a promise that resolves to the data (including single workflow) returned by the API.
 */
export function getWorkflow(id, status) {
  return generateIgaOrchestrationApi().get(`${workflowUrl}/${id}/${status}`);
}

/**
 * Creates draft version of workflow
 * @param {object} data workflow definition
 * @returns The response is a promise that resolves to the data (including draft workflow) returned by the API.
 */
export function createDraftWorkflow(data) {
  return generateIgaOrchestrationApi().post(`${workflowUrl}?_action=create`, data);
}

/**
 * Validates workflow definition is built properly
 * @param {object} data workflow definition
 * @returns The response is a promise that resolves to the data returned by the API.
 */
export function validateDraftWorkflow(data) {
  return generateIgaOrchestrationApi().post(`${workflowUrl}?_action=validate`, data);
}

/**
 * Creates a new workflow
 * @param {object} data workflow definition
 * @returns The response is a promise that resolves to the data returned by the API.
 */
export function createNewWorkflow(data) {
  return generateIgaOrchestrationApi().post(`${workflowUrl}?_action=create`, data);
}

/**
 * Publishes a draft workflow, setting its status as published
 * @param {object} data workflow definition
 * @returns The response is a promise that resolves to the data returned by the API.
 */
export function publishDraftWorkflow(data) {
  return generateIgaOrchestrationApi().post(`${workflowUrl}?_action=publish`, data);
}

/**
 * Updates a draft workflow
 * @param {string} id unique identifier of workflow to return
 * @param {object} data workflow definition
 * @returns The response is a promise that resolves to the data (including draft workflow) returned by the API.
 */
export function updateDraftWorkflow(id, data) {
  return generateIgaOrchestrationApi().put(`${workflowUrl}/${id}`, data);
}

/**
 * Deletes a draft workflow
 * @param {string} id unique identifier of workflow to delete
 * @returns The response is a promise that resolves to the data (including draft workflow) returned by the API.
 */
export function deleteDraftWorkflow(id) {
  return generateIgaOrchestrationApi().delete(`${workflowUrl}/${id}/draft`);
}

/**
 * Deletes a published workflow
 * @param {string} id unique identifier of workflow to delete
 * @returns The response is a promise that resolves to the data (including draft workflow) returned by the API.
 */
export function deletePublishedWorkflow(id) {
  return generateIgaOrchestrationApi().delete(`${workflowUrl}/${id}/published`);
}
