/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';

const formsUrl = '/governance/requestFormAssignments';

/**
 * Creates a form assignment.
 *
 * @param {Object} assignmentObject - The assignment object containing the form assignment details.
 * @returns {Promise} A promise that resolves to the result of the form assignment creation.
 */
export function createFormAssignment(assignmentObject) {
  return generateIgaApi().post(`${formsUrl}?_action=assign`, assignmentObject);
}

/**
 * Deletes a form assignment.
 *
 * @param {Object} assignmentObject - The assignment object to be deleted.
 * @returns {Promise} A promise that resolves with the result of the deletion.
 */
export function deleteFormAssignment(assignmentObject) {
  return generateIgaApi().post(`${formsUrl}?_action=unassign`, assignmentObject);
}

/**
 * Retrieves the form assignment by workflow node.
 *
 * @param {string} workflowId - The ID of the workflow.
 * @param {string} nodeId - The ID of the workflow node.
 * @returns {Promise} A promise that resolves to the form assignment.
 */
export function getFormAssignmentByWorkflowNode(workflowId, nodeId) {
  return generateIgaApi().get(`${formsUrl}?_queryFilter=objectId eq "workflow/${workflowId}/node/${nodeId}"`);
}

/**
* Retrieves the form assignment by form ID.
*
* @param {string} formId - The ID of the form.
* @returns {Promise} A promise that resolves to the form assignment.
*/
export function getFormAssignmentByFormId(formId) {
  return generateIgaApi().get(`${formsUrl}?_queryFilter=formId eq "${formId}"`);
}

/**
 * Retrieves the form assignment by request type ID.
 *
 * @param {string} requestTypeId - The ID of the request type.
 * @returns {Promise} A Promise that resolves to the form assignment.
 */
export function getFormAssignmentByRequestType(requestTypeId) {
  return generateIgaApi().get(`${formsUrl}?_queryFilter=objectId eq "requestType/${requestTypeId}"`);
}

/**
 * Retrieves the request types for a given form ID.
 *
 * @param {string} formId - The ID of the form.
 * @returns {Promise} - A promise that resolves to the form assignment.
 */
export function getFormRequestTypes(formId) {
  return generateIgaApi().get(`${formsUrl}?_queryFilter=objectId co "requestType/" and formId eq "${formId}"`);
}

/**
 * Retrieves the form application assignments for a given form ID.
 *
 * @param {string} formId - The ID of the form.
 * @returns {Promise} A promise that resolves with the form application assignments.
 */
export function getFormApplications(formId) {
  return generateIgaApi().get(`${formsUrl}?_queryFilter=objectId co "application/" and formId eq "${formId}"`);
}

/**
 * Retrieves the request form assignment for a specific application and object type.
 *
 * @param {string} applicationId - The ID of the application.
 * @param {string} objectType - The connector object type.
 * @returns {Promise} A promise that resolves to the request form assignment.
 */
export function getApplicationRequestFormAssignment(applicationId, objectType) {
  const objectId = `application/${applicationId}/${objectType}/create`;
  return generateIgaApi().get(`${formsUrl}?_queryFilter=objectId eq "${objectId}"`);
}
