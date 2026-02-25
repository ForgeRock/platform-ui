/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getBasicFilter, getPriorityFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import dayjs from 'dayjs';
import i18n from '@/i18n';

export const sortKeysMap = {
  name: 'role.name',
  status: 'status',
};

export const sortByOptions = [
  {
    value: 'name',
    text: i18n.global.t('common.name'),
  },
  {
    value: 'status',
    text: i18n.global.t('common.status'),
  },
];

export const patternSortByOptions = [
  {
    value: 'userCount',
    text: i18n.global.t('governance.accessModeling.roleDetails.accessPatterns.userCount'),
  },
  {
    value: 'attributeCount',
    text: i18n.global.t('governance.accessModeling.roleDetails.accessPatterns.attributeCount'),
  },
];

/**
 * Generates a filter object for governance access modeling requests based on provided criteria.
 * @param {Object} filter - The filter criteria object
 * @param {string} [status] - Request status to filter by
 * @returns {Object} Filter object
 */
export function getRequestFilter(filter, status) {
  const allFilters = [];

  if (filter.query) {
    allFilters.push({
      operator: 'OR',
      operand: [
        getBasicFilter('CONTAINS', 'user.userName', filter.query),
        getBasicFilter('CONTAINS', 'user.givenName', filter.query),
        getBasicFilter('CONTAINS', 'user.sn', filter.query),
        getBasicFilter('CONTAINS', 'requester.userName', filter.query),
        getBasicFilter('CONTAINS', 'requester.givenName', filter.query),
        getBasicFilter('CONTAINS', 'requester.sn', filter.query),
        getBasicFilter('EQUALS', 'id', filter.query),
      ],
    });
  }

  if (filter.requestType) allFilters.push(getBasicFilter('EQUALS', 'requestType', filter.requestType));

  if (filter.priorities) {
    const priorityFilters = getPriorityFilter(filter.priorities);
    if (priorityFilters) {
      allFilters.push(priorityFilters);
    }
  }

  // status for requests is handled in the filter
  // status for approvals is handled in query param
  if (status) {
    switch (status) {
      case 'in-progress':
        allFilters.push(getBasicFilter('EQUALS', 'decision.status', status));
        break;
      case 'suspended':
        allFilters.push(getBasicFilter('EQUALS', 'decision.status', 'suspended'));
        break;
      case 'cancelled':
        allFilters.push(getBasicFilter('EQUALS', 'decision.status', 'cancelled'));
        break;
      case 'complete':
        allFilters.push(getBasicFilter('EQUALS', 'decision.status', 'complete'));
        break;
      default:
        break;
    }
  }

  return {
    operand: allFilters,
    operator: 'AND',
  };
}

/**
 * Get the text to display for the given status.
 * @param {Object} statusOptions - The available status options
 * @param {string} status - The status value to get the text for
 * @returns {string} The text corresponding to the status value
 */
export function getStatusText(statusOptions, status) {
  return statusOptions.find((option) => option.value === status)?.text;
}

/**
 * Was the role discovered via role mining
 *
 * @param {object} role IGA Role object
 * @returns If the role was discovered via role mining
 */
export function isRoleMiningRole(role) {
  return role?.candidateId;
}

/**
 * Formats a given date into a readable string format 'MMM D, YYYY'.
 * @param {String} date - The date to format.
 * @returns {String} The formatted date string. Returns an empty string if the date is not provided.
 */
export function getRoleDateText(date) {
  if (!date) return '';
  return dayjs(date).format('MMM D, YYYY h:mm A');
}

export const roleStatuses = {
  ACTIVE: 'active',
  CANDIDATE: 'candidate',
  DRAFT: 'draft',
};

/**
 * Get the badge variant for various account types
 * @param {string} roleStatus - The role status value to get the badge variant for
 * @returns {string} The badge variant corresponding to the role status
 */
export function getRoleStatusVariant(roleStatus) {
  const status = roleStatus.toLowerCase();
  if (status === roleStatuses.ACTIVE) {
    return 'success';
  }
  if (status === roleStatuses.DRAFT) {
    return 'warning';
  }
  return 'light';
}

/**
 * Get the count of role recommendations for a given role.
 * @param {object} role - The role object
 * @param {object} candidateRole - The candidate role object
 * @returns {object} An object containing the count of role recommendations for each key
 */
export function getRoleRecommendationsCount(role, candidateRole) {
  const keys = ['entitlements', 'justifications'];
  const result = {};

  keys.forEach((key) => {
    const roleValues = new Set(role[key] ?? []);
    const candidateRoleValues = new Set(candidateRole[key] ?? []);

    result[key] = [...roleValues].filter((v) => !candidateRoleValues.has(v)).length + [...candidateRoleValues].filter((v) => !roleValues.has(v)).length;
  });
  return result;
}
