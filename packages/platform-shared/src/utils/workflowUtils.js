/**
 * Copyright 2024-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { getWorkflow } from '@forgerock/platform-shared/src/api/governance/WorkflowApi';

/**
 * Workflow status constants used by the governance module.
 */
export const WORKFLOW_STATUS = Object.freeze({
  PUBLISHED: 'published',
  DRAFT: 'draft',
});

/**
 * Retrieves the display name of a workflow based on the provided workflow ID.
 * This method search for the published workflow first, if it doesn't exist, it will search for the draft workflow.
 * If the workflow doesn't exist, the workflow ID is returned.
 * @param {string} workflowId - The ID of the workflow.
 * @returns {Promise} A promise that resolves to the display name of the workflow.
 */
export async function getWorkflowDisplayName(workflowId) {
  try {
    // first look for the published workflow
    let workflow = await getWorkflow(workflowId, WORKFLOW_STATUS.PUBLISHED);
    if (workflow.data?.displayName) {
      return workflow.data.displayName;
    }
    // if there is no published workflow, look for the draft workflow
    workflow = await getWorkflow(workflowId, WORKFLOW_STATUS.DRAFT);
    // if no workflow is found, return the workflow ID, can happen if the workflow is deleted
    return workflow.data?.displayName || workflow.data?.id || workflowId;
  } catch {
    return workflowId;
  }
}

/**
  * Helper function to sort the workflows table data, this method is passed to the
  * bootstrap vue table using the sort-compare property that receives a function to compare the data
  * @docs https://bootstrap-vue.org/docs/components/table#custom-sort-compare-routine
  *
  * @param {Object} aRow - row a to compare
  * @param {Object} bRow - row b to compare
  * @param {String} key - key to compare
  * @param {Boolean} sortDesc - sort direction
  * @param {Function} formatter - formatter function
  * @param {Object} compareOptions - compare options table prop
  * @param {String} compareLocale - compare locale table prop
 */
export function sortCompareWorkflows(aRow, bRow, key, sortDesc, formatter, compareOptions, compareLocale) {
  if (key === 'workflow') {
    const aDisplayName = aRow?.displayName;
    const bDisplayName = bRow?.displayName;
    return aDisplayName.localeCompare(bDisplayName, compareLocale, compareOptions);
  }
  return 0;
}

/**
 * Helper function to filter the workflows table data, this method is passed to the
 * bootstrap vue table using the filter-function property that receives a function to filter the data
 * @docs https://bootstrap-vue.org/docs/components/table#custom-filter-function
 *
 * @param {Object} workflow - workflow to filter
 * @param {String} filter - filter string
 */
export function filterWorkflows(workflow, filter) {
  const workflowDisplayName = workflow?.displayName;
  const workflowDescription = workflow?.description;
  return workflowDisplayName.toLowerCase().includes(filter.toLowerCase())
    || workflowDescription.toLowerCase().includes(filter.toLowerCase());
}
