/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { cloneDeep, uniq } from 'lodash';
import { getBasicFilter, getPriorityFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { getRequestType } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import dayjs from 'dayjs';
import i18n from '@/i18n';

/**
 * Retrieves the phase name from the request object.
 * First looks for the first phase from the active phase assigned to user (request.phases)
 * If that is not present, gets the last phase from all of the phases on the request (request.decision.phases)
 * @param {Object} request - The request object.
 * @param {Array} request.phases - These phases represent the current phases assigned to a user on a request.
 * @param {Array} request.decision.phases - These phases represent all phases on a request.
 * @returns {string|undefined} - The phase name, or undefined if not found.
 */
export function getPhaseName(request) {
  return request.phases?.[0]?.name || request?.decision?.phases?.pop()?.name;
}

/**
 * Gets image source for the priority icons based on priority level
 * @param {String} priority access request priority: high, medium, low
 * @returns {String} image src for the given priority
 */
export function getPriorityImageSrc(priority) {
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

/** Gets image `alt` attribute text for the given priority.
 * @param {String} priority - The priority level of the request: high, medium, low.
 * @returns {String} The alt text for a valid priority level, else an empty string.
*/
export function getPriorityImageAltText(priority) {
  // map of priority levels to their respective locale keys
  const localePriorityKeys = {
    high: 'high',
    medium: 'med',
    low: 'low',
  };
  const priorityLevel = localePriorityKeys[priority] || '';
  const priorityText = priorityLevel
    ? i18n.global.t(`governance.accessRequest.newRequest.priority.${priorityLevel}`)
    : '';

  // returns valid alt text if priority and relevant priority locale are valid, else returns empty alt text
  return priority && priorityText
    ? i18n.global.t('governance.accessRequest.priorityImageAltText', { priority: priorityText })
    : '';
}

export const detailTypes = {
  APPROVAL: 'approval',
  ADMIN_REQUEST: 'adminRequest',
  USER_REQUEST: 'userRequest',
  FULFILLMENT: 'fulfillment',
};

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
  CREATE_ENTITLEMENT: {
    label: 'governance.accessRequest.requestTypes.createEntitlement',
    value: 'createEntitlement',
  },
  MODIFY_ENTITLEMENT: {
    label: 'governance.accessRequest.requestTypes.modifyEntitlement',
    value: 'modifyEntitlement',
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

export function isSupportedRequestType(requestType) {
  return Object.values(requestTypes).some((type) => type.value === requestType);
}

export const sortKeysMap = {
  date: 'decision.startDate',
  requestedFor: 'user.userName',
  priority: 'request.common.priority',
  id: 'metadata.primaryKey',
};

export const sortByOptions = [
  {
    value: 'date',
    text: i18n.global.t('governance.accessRequest.requestDate'),
  },
  {
    value: 'requestedFor',
    text: i18n.global.t('governance.accessRequest.requestedFor'),
  },
  {
    value: 'priority',
    text: i18n.global.t('common.priority'),
  },
  {
    value: 'id',
    text: i18n.global.t('governance.accessRequest.requestId'),
  },
];

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
  if (requestType.toLowerCase().includes('entitlement')) return 'entitlement';
  if (requestType.includes('role')) return 'role';
  return '';
}

/**
 * Retrieves the display name for a given request type.
 * @param {String} requestType - The type of the request.
 * @returns {Promise<Object>} A promise that resolves to the request type display name or an object containing the request type ID in case of an error.
 */
export async function getRequestTypeDisplayName(requestType) {
  try {
    return await getRequestType(requestType);
  } catch (error) {
    return { data: { id: requestType } };
  }
}

/**
 * Retrieves the display names of request types and adds them to the requests.
 *
 * @param {Array} requests - The array of requests.
 * @returns {Promise<Array>} - The array of requests with request type display names added.
 */
export async function getRequestTypeDisplayNames(requests) {
  const requestsClone = cloneDeep(requests);
  const uniqRequestTypes = uniq(requests.map((request) => request.requestType));
  const allRequestTypesPromises = [];
  const allRequestTypes = {};

  // get each request type to get the display name. Then create an
  // object that maps the request type to the display name
  uniqRequestTypes.forEach((requestType) => {
    allRequestTypesPromises.push(getRequestTypeDisplayName(requestType));
  });
  const typeData = await Promise.all(allRequestTypesPromises);
  typeData.forEach((requestType) => {
    const requestTypeData = requestType.data;
    if (!requestTypeData) return;
    allRequestTypes[requestTypeData.id] = requestTypeData.displayName || requestTypeData.id;
  });

  // add request type display names to requests
  requestsClone.forEach((request) => {
    request.requestTypeDisplayName = allRequestTypes[request.requestType];
  });
  return requestsClone;
}

/**
 * Get translated text of the request type
 * @param {String} requestType access request type: accountGrant, roleGrant, etc.
 * @returns {String} text to display as the request type
 */
export function getTypeString(requestType) {
  return i18n.global.t(`governance.accessRequest.requestTypes.${requestType}`);
}

/**
 * Generates a display text for the requester based on their details.
 * @param {Object} requester - The requester user.
 * @returns {String} The display text for the requester.
 */
function getRequestedByText(requester) {
  const value = requester || null;
  if (value?.id === 'SYSTEM') return i18n.global.t('common.system');
  if (value?.givenName || value?.sn) return i18n.global.t('common.userFullName', { givenName: value.givenName, sn: value.sn });
  return value?.userName || '';
}

/**
 * Generates a display text for the requested user.
 * @param {Object} requestedFor - The user object containing user details.
 * @returns {String} The full name of the user if available, otherwise the username or an empty string.
 */
function getRequestedForText(requestedFor) {
  const value = requestedFor || null;
  if (value?.givenName || value?.sn) return i18n.global.t('common.userFullName', { givenName: value.givenName, sn: value.sn });
  return value?.userName || '';
}

/**
 * Formats a given date into a readable string format 'MMM D, YYYY'.
 * @param {String} date - The date to format.
 * @returns {String} The formatted date string. Returns an empty string if the date is not provided.
 */
function getRequestedDateText(date) {
  if (!date) return '';
  return dayjs(date).format('MMM D, YYYY');
}

/**
 * Returns the basic request display object for a given request.
 * This is used for requests that are not for applications, entitlement, or roles
 *
 * @param {Object} request - The request object.
 * @returns {Object} The basic request display object.
 */
function getBasicRequestDisplay(request) {
  return {
    details: {
      id: request.id,
      type: request.requestTypeDisplayName || request.requestType,
      priority: request.request?.common?.priority,
      date: getRequestedDateText(request.decision?.startDate),
      requestedBy: getRequestedByText(request.requester),
      requestedFor: getRequestedForText(request.user),
      isCustom: true,
    },
    rawData: request,
  };
}

/**
 * Returns an object containing the advanced request display details.
 * This is used for requests that are for applications, entitlements, or roles.
 *
 * @param {Object} request - The request object.
 * @param {string} objectType - The type of the object.
 * @returns {Object} - An object containing the advanced request display details.
 */
function getAdvancedRequestDisplay(request, objectType) {
  let name = objectType === 'entitlement'
    ? request.descriptor?.idx?.['/entitlement']?.displayName || request[objectType]?.displayName
    : request[objectType]?.name;
  if (request.requestType === requestTypes.CREATE_ENTITLEMENT.value) {
    name = `${request.application.name} - ${request.request?.entitlement?.objectType}`;
  }
  return {
    details: {
      id: request.id,
      type: getTypeString(request.requestType),
      name,
      description: objectType === 'entitlement' ? request.glossary?.idx?.['/entitlement']?.description || request[objectType]?.description : request[objectType]?.description,
      priority: request.request?.common?.priority,
      date: getRequestedDateText(request.decision?.startDate),
      requestedFor: getRequestedForText(request.user),
      requestedBy: getRequestedByText(request.requester),
      icon: objectType === 'role' ? 'assignment_ind' : getApplicationLogo(request.application),
    },
    rawData: request,
  };
}

/**
 * Given any access request, return the object for displaying in the table
 * @param {Object} request access request
 * @returns {Object} access request that is formatted for display
 */
export function getFormattedRequest(request) {
  if (isSupportedRequestType(request.requestType)) {
    const objectType = getRequestObjectType(request.requestType);
    return getAdvancedRequestDisplay(request, objectType);
  }
  return getBasicRequestDisplay(request);
}

/**
 * Converts access request objects to have information at the top level
 * that is necessary for the table display
 * @param {Object[]} requests Access request objects
 * @returns {Object[]} request objects
 */
export function buildRequestDisplay(requests) {
  return requests.map((request) => getFormattedRequest(request));
}

/**
 * Checks if the given request type is a role.
 *
 * @param {string} requestType - The request type to check.
 * @returns {boolean} - Returns true if the request type is a role, false otherwise.
 */
export function isTypeRole(requestType) {
  return getRequestObjectType(requestType) === 'role';
}
