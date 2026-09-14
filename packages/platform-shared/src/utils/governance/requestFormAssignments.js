/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  isEmpty,
} from 'lodash';
import { getRequestForm } from '@forgerock/platform-shared/src/api/governance/RequestFormsApi';
import {
  createFormAssignment,
  deleteFormAssignment,
  getApplicationFormAssignments,
  getApplicationRequestFormAssignment,
  getFormAssignmentByWorkflowNode,
  getFormAssignmentByFormId,
  getFormAssignmentByRequestType,
  getFormAssignmentByLcmOperation,
} from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';
import { getAccountObjectTypeNameFromApp } from '@forgerock/platform-shared/src/utils/governance/entitlements';

/**
 * Returns an object representing the assignment of a form to a workflow node.
 *
 * @param {string} formId - The ID of the form.
 * @param {string} workflowId - The ID of the workflow.
 * @param {string} nodeId - The ID of the workflow node.
 * @returns {Object} - The assignment object.
 */
function getWorkflowFormAssignmentObject(formId, workflowId, nodeId) {
  return {
    formId,
    objectId: `workflow/${workflowId}/node/${nodeId}`,
  };
}

/**
 * Returns an object representing the assignment of a form to a custom request type.
 *
 * @param {string} formId - The ID of the form.
 * @param {string} requestTypeId - The ID of the request type.
 * @returns {Object} The assignment object.
 */
export function getCustomRequestFormAssignmentObject(formId, requestTypeId) {
  return {
    formId,
    objectId: `requestType/${requestTypeId}`,
  };
}

/**
 * Builds an array of promises for creating or updating form assignments.
 *
 * @param {string} workflowId - The ID of the workflow.
 * @param {Object} formUpdates - An object containing the form updates.
 * @returns {Promise<Array>} - A promise that resolves to an array of form assignment promises.
 */
export async function buildFormAssignmentPromises(workflowId, formUpdates) {
  if (!workflowId?.length || isEmpty(formUpdates)) return [];
  const promiseArray = [];
  Object.keys(formUpdates).forEach(async (nodeId) => {
    try {
      const formId = formUpdates[nodeId];
      const existingAssignments = await getFormAssignmentByWorkflowNode(workflowId, nodeId);

      // delete any existing node assignments
      const assignment = existingAssignments?.data?.result?.[0];
      if (assignment) await deleteFormAssignment({ formId: assignment.formId, objectId: assignment.objectId });

      // create new assignment
      const formAssignmentObject = getWorkflowFormAssignmentObject(formId, workflowId, nodeId);
      if (formId.length) promiseArray.push(createFormAssignment(formAssignmentObject));
    } catch (error) {
      Promise.reject(error);
    }
  });
  return Promise.resolve(promiseArray);
}

/**
* Deletes all form assignments for a given form.
* It queries the form assignments by form ID and deletes each assignment.
*
* @param {string} formId - The ID of the form.
* @returns {Promise} - A promise that resolves when all form assignments have been deleted.
*/
export async function deleteAllFormAssignments(formId) {
  const existingAssignments = await getFormAssignmentByFormId(formId);
  const assignments = existingAssignments?.data?.result;
  if (assignments?.length) {
    const promises = assignments.map((assignment) => deleteFormAssignment({ formId, objectId: assignment.objectId }));
    return Promise.all(promises);
  }
  return Promise.resolve();
}

/**
 * Retrieves the request form for a given application and application ID.
 *
 * @param {Object} application - The application object (connectorId, mappingNames, objectTypes?, isDisconnected?).
 * @param {string} applicationId - The application ID.
 * @param {string} [objectType] - The connector object type. When omitted, derived from the
 *   application's inbound user mapping (see getAccountObjectTypeNameFromApp).
 * @param {string} [operation] - The operation ("create" or "update"); required when an
 *   objectType is derivable, ignored in the disconnected fallback.
 * @returns {Promise<object|null>} A promise that resolves to the request form data if found, or null if not found.
 */
export async function getApplicationRequestForm(application, applicationId, objectType = null, operation) {
  try {
    if (!objectType) {
      // eslint-disable-next-line no-param-reassign
      objectType = getAccountObjectTypeNameFromApp(application);
    }

    if (objectType) {
      // check for a form for this application and object type
      const { data } = await getApplicationRequestFormAssignment(applicationId, objectType, operation);
      if (data.result.length) {
        const { formId } = data.result[0];
        const { data: formData } = await getRequestForm(formId);
        return formData;
      }
      return null;
    }

    // The object type could not be derived (e.g. disconnected applications have no
    // inbound user mapping), so look for any form assigned to the application.
    const { data } = await getApplicationFormAssignments(applicationId);
    if (!data.result.length) return null;

    // Prefer a form assigned for this operation, then any create/update form, then any form
    const { formId } = data.result.find((assignment) => assignment.objectId.endsWith(`/${operation}`))
      || data.result.find((assignment) => ['create', 'update'].some((op) => assignment.objectId.endsWith(`/${op}`)))
      || data.result[0];
    const { data: formData } = await getRequestForm(formId);
    return formData;
  } catch (error) {
    return null;
  }
}

/**
 * Retrieves the request form for a given workflow and phase ID.
 *
 * @param {string} workflow - The workflow identifier.
 * @param {string} phaseId - The phase identifier.
 * @returns {Promise<object|null>} A promise that resolves to the request form data if found, or null if not found.
 */
export async function getWorkflowRequestForm(workflow, phaseId) {
  try {
    const { data } = await getFormAssignmentByWorkflowNode(workflow, phaseId);
    if (data?.result?.length) {
      const { formId } = data.result[0];
      const { data: formData } = await getRequestForm(formId);
      return formData;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Retrieves the custom request form for a given request type ID.
 *
 * @param {string} requestTypeId - The ID of the request type.
 * @returns {Promise<object|null>} - A promise that resolves to the custom request form data, or null if not found.
 */
export async function getCustomRequestForm(requestTypeId) {
  try {
    const { data } = await getFormAssignmentByRequestType(requestTypeId);
    if (data?.result?.length) {
      const { formId } = data.result[0];
      const { data: formData } = await getRequestForm(formId);
      return formData;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Retrieves the custom request form for a given request type ID.
 *
 * @param {string} requestTypeId - The ID of the request type.
 * @returns {Promise<object|null>} - A promise that resolves to the custom request form data, or null if not found.
 */
export async function getLcmForm(lcmType, operation) {
  try {
    const { data } = await getFormAssignmentByLcmOperation(lcmType, operation);
    if (data?.result?.length) {
      const { formId } = data.result[0];
      const { data: formData } = await getRequestForm(formId);
      return formData;
    }
    return null;
  } catch (error) {
    return null;
  }
}
