/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getBasicFilter, getPriorityFilter, getActivePhaseFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import dayjs from 'dayjs';
import i18n from '@/i18n';

/**
 * Generates a filter object for tasks based on the provided criteria.
 * @param {Object} filter - The parameters for filtering tasks.
 * @param {string} filter.assignee - The ID of the assignee to filter tasks by.
 * @param {Array<string>} filter.priorities - The list of priorities to filter tasks by.
 * @param {string} filter.taskName - The name of the task to filter by.
 * @returns {Object} The filter object containing the filters to be applied.
 */
export function getTaskFilter({ assignee, priorities, taskName }) {
  const allFilters = [];

  if (assignee) allFilters.push(getBasicFilter('EQUALS', 'decision.actors.active.id', assignee));

  if (priorities) {
    const priorityFilters = getPriorityFilter(priorities);
    if (priorityFilters) {
      allFilters.push(priorityFilters);
    }
  }

  if (taskName) {
    const activePhaseFilter = getActivePhaseFilter(taskName);
    if (activePhaseFilter) {
      allFilters.push(activePhaseFilter);
    }
  }

  return {
    operand: allFilters,
    operator: 'AND',
  };
}

/**
 * Generates a display text for the assignee.
 * @param {Object} assignee - The user object containing user details.
 * @returns {String} The full name of the user if available, otherwise the username or an empty string.
 */
function getAssigneeText(assignee) {
  const value = assignee || null;
  if (value?.givenName || value?.sn) return i18n.global.t('common.userFullName', { givenName: value.givenName, sn: value.sn });
  return value?.userName || '';
}

/**
 * Formats a given date into a readable string format 'MMM D, YYYY'.
 * @param {String} date - The date to format.
 * @returns {String} The formatted date string. Returns an empty string if the date is not provided.
 */
function getAssignedDateText(date) {
  if (!date) return '';
  return dayjs(date).format('MMM D, YYYY');
}

/**
 * Converts task objects to have information at the top level that is necessary for the table display
 * @param {Object[]} tasks task objects
 * @returns {Object[]} task objects
 */
export function buildTaskDisplay(tasks) {
  return tasks.map((task) => {
    const phaseName = task.phases?.[0]?.name || '';
    const phaseObject = task.decision?.phases?.find((phase) => phase.name === phaseName);
    const allActors = [...task.decision?.actors?.active || [], ...task.decision?.actors?.inactive || []];
    return {
      details: {
        id: task.id,
        assignee: getAssigneeText(allActors.find((actor) => actor.phase === phaseName)),
        name: phaseObject?.displayName || phaseName,
        priority: task.request?.common?.priority,
        assignedDate: getAssignedDateText(phaseObject?.startDate),
      },
      rawData: task,
    };
  });
}
