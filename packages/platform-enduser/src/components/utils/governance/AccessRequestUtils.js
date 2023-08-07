/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';

/**
 * Gets image source for the priority icons based on priority level
 * @param {String} priority access request priority: high, medium, low
 * @returns {String} image src for the given priority
 */
export default function getPriorityImageSrc(priority) {
  try {
    const images = require.context('@forgerock/platform-shared/src/assets/images/priorities/', false, /\.svg$/);
    let imageName = '';
    if (priority === 'high') imageName = 'priority-high.svg';
    if (priority === 'medium') imageName = 'priority-med.svg';
    if (priority === 'low') imageName = 'priority-low.svg';
    return images(`./${imageName}`);
  } catch (err) {
    return '';
  }
}

export const requestTypes = {
  ACCOUNT_GRANT: {
    label: 'governance.accessRequest.requestTypes.applicationGrant',
    value: 'applicationGrant',
  },
  ACCOUNT_REVOKE: {
    label: 'governance.accessRequest.requestTypes.applicationRevoke',
    value: 'applicationRevoke',
  },
  ENTITLEMENT_GRANT: {
    label: 'governance.accessRequest.requestTypes.entitlementGrant',
    value: 'entitlementGrant',
  },
  ENTITLEMENT_REVOKE: {
    label: 'governance.accessRequest.requestTypes.entitlementRevoke',
    value: 'entitlementRevoke',
  },
  ROLE_GRANT: {
    label: 'governance.accessRequest.requestTypes.roleGrant',
    value: 'roleGrant',
  },
  ROLE_REVOKE: {
    label: 'governance.accessRequest.requestTypes.roleRevoke',
    value: 'roleRevoke',
  },
};

export const sortKeysMap = {
  date: 'decision.startDate',
  requestedFor: 'user.userName',
  priority: 'request.common.priority',
  id: 'metadata.primaryKey',
};

export function getRequestFilter(filter, status) {
  const allFilters = [];

  if (filter.requestId) allFilters.push(getBasicFilter('EQUALS', 'id', filter.requestId));
  if (filter.requestedFor) allFilters.push(getBasicFilter('EQUALS', 'user.id', filter.requestedFor.split('/').pop()));
  if (filter.requester) allFilters.push(getBasicFilter('EQUALS', 'requester.id', filter.requester));
  if (filter.requestType) allFilters.push(getBasicFilter('EQUALS', 'requestType', filter.requestType));

  if (filter.priorities) {
    const priorities = [];
    if (filter.priorities.high) priorities.push('high');
    if (filter.priorities.medium) priorities.push('medium');
    if (filter.priorities.low) priorities.push('low');

    if (!priorities.length) allFilters.push(getBasicFilter('EQUALS', 'request.common.priority', 'none'));
    else {
      const priorityFilters = priorities.map((priority) => (
        getBasicFilter('EQUALS', 'request.common.priority', priority)
      ));
      allFilters.push({
        operator: 'OR',
        operand: priorityFilters,
      });
    }
  }

  // status for requests is handled in the filter
  // status for approvals is handled in query param
  if (status) {
    switch (status) {
      case 'in-progress':
        allFilters.push(getBasicFilter('EQUALS', 'decision.status', status));
        break;
      // TODO: API will change all of these states to be reflected in decision.status
      // we can remove this logic once the API supports it
      case 'cancelled':
        allFilters.push(getBasicFilter('EQUALS', 'decision.status', 'complete'));
        allFilters.push(getBasicFilter('EQUALS', 'decision.outcome', 'cancelled'));
        break;
      case 'complete':
        allFilters.push(getBasicFilter('EQUALS', 'decision.status', status));
        allFilters.push({
          operator: 'NOT',
          operand: [{
            operator: 'EQUALS',
            operand: {
              targetName: 'decision.outcome',
              targetValue: 'cancelled',
            },
          }],
        });
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

export function getStatusText(statusOptions, status) {
  return statusOptions.find((option) => (option.value === status))?.text;
}
