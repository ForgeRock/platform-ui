/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getBasicFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import i18n from '@/i18n';

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
    label: 'governance.accessRequest.requestTypes.applicationRemove',
    value: 'applicationRemove',
  },
  ENTITLEMENT_GRANT: {
    label: 'governance.accessRequest.requestTypes.entitlementGrant',
    value: 'entitlementGrant',
  },
  ENTITLEMENT_REVOKE: {
    label: 'governance.accessRequest.requestTypes.entitlementRemove',
    value: 'entitlementRemove',
  },
  ROLE_GRANT: {
    label: 'governance.accessRequest.requestTypes.roleGrant',
    value: 'roleGrant',
  },
  ROLE_REVOKE: {
    label: 'governance.accessRequest.requestTypes.roleRemove',
    value: 'roleRemove',
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

    if (!priorities.length) {
      allFilters.push(getBasicFilter('EQUALS', 'request.common.priority', 'none'));
    } else {
      const priorityFilters = priorities.map((priority) => getBasicFilter('EQUALS', 'request.common.priority', priority));
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

export function getStatusText(statusOptions, status) {
  return statusOptions.find((option) => option.value === status)?.text;
}
/**
 * Get the base object type of the access request
 * @param {String} requestType the request type of the access request
 * @returns {String} the base object type of the request: application, entitlment, role.
 */
export function getRequestObjectType(requestType) {
  if (requestType.includes('application')) return 'application';
  if (requestType.includes('entitlement')) return 'entitlement';
  if (requestType.includes('role')) return 'role';
  return '';
}

/**
 * Get translated text of the request type
 * @param {String} requestType access request type: accountGrant, roleGrant, etc.
 * @returns {String} text to display as the request type
 */
export function getTypeString(requestType) {
  return i18n.t(`governance.accessRequest.requestTypes.${requestType}`);
}

/**
 * Given any access request, return the object for displaying in the table
 * @param {Object} request access request
 * @param {String} objectType the type of object the request is for: application, entitlment, role.
 * @returns {Object} access request that is formatted for display
 */
export function getFormattedRequest(request, objectType) {
  return {
    details: {
      id: request.id,
      type: getTypeString(request.requestType),
      name: objectType === 'entitlement' ? request.descriptor?.idx?.['/entitlement']?.displayName || request[objectType]?.displayName : request[objectType]?.name,
      description: objectType === 'entitlement' ? request.glossary?.idx?.['/entitlement']?.description || request[objectType]?.description : request[objectType]?.description,
      priority: request.request?.common?.priority,
      date: request.decision?.startDate,
      requesteeInfo: request.user,
      icon: objectType === 'role' ? 'assignment_ind' : getApplicationLogo(request.application),
    },
    rawData: request,
  };
}
/**
 * Converts access request objects to have information at the top level
 * that is necessary for the table display
 * @param {Object[]} requests Access request objects
 * @returns {Object[]} request objects
 */
export function buildRequestDisplay(requests) {
  const objectTypeList = ['application', 'entitlement', 'role'];
  return requests.map((request) => {
    const objectType = getRequestObjectType(request.requestType);
    return objectTypeList.includes(objectType) ? getFormattedRequest(request, objectType) : null;
  });
}

export function isTypeRole(requestType) {
  return getRequestObjectType(requestType) === 'role';
}
