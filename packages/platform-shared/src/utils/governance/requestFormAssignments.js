/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  isEmpty,
} from 'lodash';
import {
  createFormAssignment,
  deleteFormAssignment,
  getFormAssignmentByWorkflowNode,
  getFormAssignmentByFormId,
} from '@forgerock/platform-shared/src/api/governance/RequestFormAssignmentsApi';

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
  if (assignments.length) {
    const promises = assignments.map((assignment) => deleteFormAssignment({ formId, objectId: assignment.objectId }));
    return Promise.all(promises);
  }
  return Promise.resolve();
}
