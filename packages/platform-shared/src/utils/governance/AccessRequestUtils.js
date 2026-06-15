/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  cloneDeep, debounce, uniq, find,
} from 'lodash';
import { ref } from 'vue';
import { getBasicFilter, getPriorityFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getPredictionDisplayInfo, isHighConfidence, isLowConfidence } from '@forgerock/platform-shared/src/utils/governance/prediction';
import { getApplicationLogo } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { getRequestType, getRequestTypes } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
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
  SCHEDULED: 'scheduled',
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
  CREATE_ROLE: {
    label: 'governance.accessRequest.requestTypes.createRole',
    value: 'createRole',
  },
  DELETE_ROLE: {
    label: 'governance.accessRequest.requestTypes.deleteRole',
    value: 'deleteRole',
  },
  MODIFY_ROLE: {
    label: 'governance.accessRequest.requestTypes.modifyRole',
    value: 'modifyRole',
  },
  PUBLISH_ROLE: {
    label: 'governance.accessRequest.requestTypes.publishRole',
    value: 'publishRole',
  },
  CREATE_USER: {
    label: 'governance.accessRequest.requestTypes.createUser',
    value: 'createUser',
  },
  MODIFY_USER: {
    label: 'governance.accessRequest.requestTypes.modifyUser',
    value: 'modifyUser',
  },
  DELETE_USER: {
    label: 'governance.accessRequest.requestTypes.deleteUser',
    value: 'deleteUser',
  },
  ROLE_GRANT: {
    label: 'governance.accessRequest.requestTypes.roleGrant',
    value: 'roleGrant',
  },
  ROLE_REVOKE: {
    label: 'governance.accessRequest.requestTypes.roleRemove',
    value: 'roleRemove',
  },
  EXTEND_END_DATE: {
    label: 'governance.accessRequest.requestTypes.extendEndDate',
    value: 'extendEndDate',
  },
};

export const OOTB_NO_FORM_REQUEST_TYPES = [
  requestTypes.ROLE_GRANT,
  requestTypes.ROLE_REVOKE,
  requestTypes.ACCOUNT_GRANT,
  requestTypes.ACCOUNT_REVOKE,
  requestTypes.ENTITLEMENT_GRANT,
  requestTypes.ENTITLEMENT_REVOKE,
  requestTypes.EXTEND_END_DATE,
];

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
        getBasicFilter('EQUALS', 'id', filter.query),
      ],
    });
  }
  if (filter.user) {
    allFilters.push({
      operator: 'OR',
      operand: [
        getBasicFilter('CONTAINS', 'user.userName', filter.user),
        getBasicFilter('CONTAINS', 'user.givenName', filter.user),
        getBasicFilter('CONTAINS', 'user.sn', filter.user),
      ],
    });
  }
  if (filter.requester) {
    allFilters.push({
      operator: 'OR',
      operand: [
        getBasicFilter('CONTAINS', 'requester.userName', filter.requester),
        getBasicFilter('CONTAINS', 'requester.givenName', filter.requester),
        getBasicFilter('CONTAINS', 'requester.sn', filter.requester),
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
      case 'draft':
        allFilters.push(getBasicFilter('EQUALS', 'request.common.isDraft', true));
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

export function getStatusText(statusOptions, status) {
  return statusOptions.find((option) => option.value === status)?.text;
}
/**
 * Get the base object type of the access request
 * @param {String} requestType the request type of the access request
 * @returns {String} the base object type of the request: application, entitlment, role.
 */
export function getRequestObjectType(requestType, requestCommonObject = {}) {
  if (requestType.includes('application') || requestCommonObject.grantType === 'accountGrant') return 'application';
  if (requestType.toLowerCase().includes('entitlement') || requestCommonObject.grantType === 'entitlementGrant') return 'entitlement';
  if (requestType.toLowerCase().includes('role') || requestCommonObject.grantType === 'roleMembership') return 'role';
  if (requestType === 'createUser' || requestType === 'deleteUser' || requestType === 'modifyUser') return 'lcmUser';
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
 * Get the resume date for the given request.
 * @param {Object} request - The request to check.
 * @returns {String} The resume date string. Returns an empty string if the date is not provided.
 */
function getRequestedResumeDate(request) {
  const waitTask = find(request.decision?.phases, (phase) => phase.name.includes('waitTask'));
  if (waitTask) return dayjs(waitTask.events.scheduled.date).local().format();
  return null;
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
      resumeDate: getRequestedResumeDate(request),
      isCustom: true,
    },
    rawData: request,
  };
}

/**
 * Generates a name string based on the provided request and object type.
 *
 * @param {Object} request - The request object containing details for generating the name string.
 * @param {string} objectType - The type of request object to retrieve the name for (e.g., 'entitlement', 'lcmUser').
 * @returns {string} The generated name string based on the request and object type. Returns an empty string if required data is missing.
 */
export function getNameString(request, objectType) {
  if (request.requestType === requestTypes.CREATE_ENTITLEMENT.value) {
    return `${request.application.name} - ${request.request?.entitlement?.objectType}`;
  }

  if (objectType === 'entitlement') {
    return request.descriptor?.idx?.['/entitlement']?.displayName || request[objectType]?.displayName;
  }

  if (objectType === 'lcmUser') {
    const user = request.user || request.request?.user?.object;
    if (!(user?.givenName && user?.sn && user?.userName)) return '';
    return i18n.global.t('common.userFullNameUserName', { givenName: user.givenName, sn: user.sn, userName: user.userName });
  }

  return request[objectType]?.name;
}

function getIcon(request, objectType) {
  if (objectType === 'role') return 'assignment_ind';
  if (objectType === 'lcmUser') return 'group';
  return getApplicationLogo(request.application);
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
  return {
    details: {
      id: request.id,
      type: getTypeString(request.requestType),
      name: getNameString(request, objectType),
      priority: request.request?.common?.priority,
      date: getRequestedDateText(request.decision?.startDate),
      requestedFor: getRequestedForText(request.user),
      requestedBy: getRequestedByText(request.requester),
      resumeDate: getRequestedResumeDate(request),
      icon: getIcon(request, objectType),
    },
    rawData: request,
  };
}

/**
 * Checks if a request type qualifies for recommendations.
 * @param {string} requestType The type of request
 * @returns Whether or not the request type is one that qualifies for recommendations
 */
export function isRecommendationRequestType(requestType) {
  const recommendationRequestTypes = [
    requestTypes.ENTITLEMENT_GRANT.value,
    requestTypes.ENTITLEMENT_REVOKE.value,
  ];
  return recommendationRequestTypes.includes(requestType);
}

/**
 * Determines if the recommendation banner should be shown based on the request type and prediction confidence.
 * @param {object} request Request object
 * @param {object} autoIdSettings Auto ID configuration
 * @returns should the recommendation banner be shown
 */
export function showRecommendationBanner(request, autoIdSettings) {
  return Boolean(autoIdSettings.enableAutoId
    && isRecommendationRequestType(request.rawData.requestType)
    && (isHighConfidence(request.details.prediction, autoIdSettings) || isLowConfidence(request.details.prediction, autoIdSettings)));
}

/**
 * Adds prediction display data to the request display object
 * @param {Object} request access request
 * @param {Object} autoIdSettings Auto ID configuration
 * @param {Object} userSchema User schema properties
 */
export function addPredictionDataToRequest(request, autoIdSettings, userSchema) {
  if (autoIdSettings?.enableAutoId && isRecommendationRequestType(request.rawData.requestType)) {
    request.details.prediction = getPredictionDisplayInfo(request.rawData, autoIdSettings, userSchema);
  }
}

/**
 * Given any access request, return the object for displaying in the table
 * @param {Object} request access request
 * @param {Object} autoIdSettings Auto ID configuration
 * @param {Object} userSchema User schema properties
 * @returns {Object} access request that is formatted for display
 */
export function getFormattedRequest(request, autoIdSettings, userSchema) {
  if (isSupportedRequestType(request.requestType)) {
    const objectType = getRequestObjectType(request.requestType, request?.request?.common);
    const advancedRequest = getAdvancedRequestDisplay(request, objectType);
    addPredictionDataToRequest(advancedRequest, autoIdSettings, userSchema);
    return advancedRequest;
  }
  return getBasicRequestDisplay(request);
}

/**
 * Converts access request objects to have information at the top level
 * that is necessary for the table display
 * @param {Object[]} requests Access request objects
 * @param {Object} autoIdSettings Auto ID configuration
 * @param {Object} userSchema User schema properties
 * @returns {Object[]} request objects
 */
export function buildRequestDisplay(requests, autoIdSettings, userSchema) {
  return requests.map((request) => getFormattedRequest(request, autoIdSettings, userSchema));
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

export function isTypeLcm(requestType) {
  return getRequestObjectType(requestType) === 'lcmUser';
}

/**
 * Composable that encapsulates async fetching of request types for the filter panel.
 * Returns a reactive `requestTypeOptions` ref (initialized to the "All" option) and a
 * 500ms-debounced `handleRequestTypeSearchChange(query)` handler that re-fetches request
 * types from the API and repopulates the ref. Uses a sequence number to discard stale
 * results when multiple in-flight requests are in progress simultaneously.
 * @returns {{ requestTypeOptions: import('vue').Ref<Array>, searchRequestTypes: Function }}
 */
export function useRequestTypeOptions() {
  const allOption = { text: i18n.global.t('governance.accessRequest.requestTypes.all'), value: 'all' };
  const requestTypeOptions = ref([allOption]);
  let latestSequence = 0;

  async function fetchTypeOptions(searchText) {
    latestSequence += 1;
    const sequence = latestSequence;
    try {
      const { data } = await getRequestTypes(undefined, searchText);
      if (sequence !== latestSequence) return;
      const typeOptions = (data.result || []).map((item) => ({ value: item.id, text: item.displayName || item.id }));
      requestTypeOptions.value = [allOption, ...typeOptions];
    } catch (error) {
      if (sequence !== latestSequence) return;
      showErrorMessage(error, i18n.global.t('governance.accessRequest.requestTypesError'));
    }
  }

  const searchRequestTypes = debounce((query) => {
    fetchTypeOptions(query);
  }, 500);

  return { requestTypeOptions, searchRequestTypes };
}

/**
 * Returns the list of request type filter options.
 * @returns {Array} request type select options
 */
export function getRequestTypeOptions() {
  return [
    { text: i18n.global.t('governance.accessRequest.requestTypes.all'), value: 'all' },
    { text: i18n.global.t(requestTypes.ACCOUNT_GRANT.label), value: requestTypes.ACCOUNT_GRANT.value },
    { text: i18n.global.t(requestTypes.ACCOUNT_REVOKE.label), value: requestTypes.ACCOUNT_REVOKE.value },
    { text: i18n.global.t(requestTypes.ENTITLEMENT_GRANT.label), value: requestTypes.ENTITLEMENT_GRANT.value },
    { text: i18n.global.t(requestTypes.ENTITLEMENT_REVOKE.label), value: requestTypes.ENTITLEMENT_REVOKE.value },
    { text: i18n.global.t(requestTypes.CREATE_ENTITLEMENT.label), value: requestTypes.CREATE_ENTITLEMENT.value },
    { text: i18n.global.t(requestTypes.MODIFY_ENTITLEMENT.label), value: requestTypes.MODIFY_ENTITLEMENT.value },
    { text: i18n.global.t(requestTypes.ROLE_GRANT.label), value: requestTypes.ROLE_GRANT.value },
    { text: i18n.global.t(requestTypes.ROLE_REVOKE.label), value: requestTypes.ROLE_REVOKE.value },
    { text: i18n.global.t(requestTypes.CREATE_USER.label), value: requestTypes.CREATE_USER.value },
    { text: i18n.global.t(requestTypes.MODIFY_USER.label), value: requestTypes.MODIFY_USER.value },
    { text: i18n.global.t(requestTypes.DELETE_USER.label), value: requestTypes.DELETE_USER.value },
  ];
}

/**
 * Returns the initial filter data shape for the access request filter panel.
 * @param {String} defaultStatus - The default status value to pre-select.
 * @returns {Object} initial filter data keyed by filter field name
 */
export function getInitialRequestFilterData(defaultStatus) {
  return {
    status: {
      value: defaultStatus,
    },
    priorities: {
      value: {
        high: true,
        medium: true,
        low: true,
        none: true,
      },
    },
    requestType: {
      value: 'all',
    },
    query: {
      value: '',
    },
    requester: {
      value: '',
    },
    user: {
      value: '',
    },
  };
}

/**
 * Counts the number of active filters from the filter data object.
 * @param {Object} filterData - The current filter data state.
 * @returns {Number} count of active filters
 */
export function getNumFilters(filterData) {
  if (!filterData) return 0;
  let count = 0;
  const {
    status, priorities, requestType, query,
  } = filterData;
  if (status?.value && status.value !== 'in-progress') count += 1;
  if (priorities) {
    const p = priorities.value;
    if (!p.high) count += 1;
    if (!p.medium) count += 1;
    if (!p.low) count += 1;
    if (!p.none) count += 1;
  }
  if (requestType?.value && requestType.value !== 'all') count += 1;
  if (query?.value?.length) count += 1;
  return count;
}

/**
 * Builds the accessFilter config object for FrAccessFilter.
 * Accepts Vue component classes and reactive options so the utility stays framework-agnostic.
 * @param {Object} components - Vue component references: { BFormRadioGroup, FrPriorityFilter, FrSelectInput, FrField, FrGovResourceSelect }
 * @param {Object} options - Reactive data: { statusOptions, filterData }
 * @returns {Object} accessFilter config
 */
export function getAccessFilterConfig(components, options) {
  const {
    BFormRadioGroup, FrPriorityFilter, FrSelectInput, FrField,
  } = components;
  const { statusOptions, filterData } = options;

  return {
    status: {
      name: i18n.global.t('governance.access.filter.status'),
      components: [
        {
          id: 'statuses',
          component: BFormRadioGroup,
          modelKey: 'statuses',
          props: {
            value: filterData.status.value,
            stacked: true,
            class: 'mr-2',
            options: statusOptions,
            label: i18n.global.t('governance.access.filter.status'),
            name: 'status',
          },
        },
      ],
    },
    priorities: {
      name: i18n.global.t('governance.accessRequest.priorities.priorities'),
      components: [
        {
          id: 'priorities',
          component: FrPriorityFilter,
          props: {
            name: 'priorities',
            value: filterData.priorities.value,
            class: 'mb-4 mt-2',
          },
        },
      ],
    },
    requestType: {
      name: i18n.global.t('governance.accessRequest.requestDetails'),
      components: [
        {
          id: 'requestType',
          component: FrSelectInput,
          props: {
            name: 'requestType',
            value: filterData.requestType.value,
            label: i18n.global.t('governance.accessRequest.requestType'),
            internalSearch: false,
            class: 'mb-4 request-type-select',
          },
        },
        {
          id: 'query',
          component: FrField,
          props: {
            name: 'query',
            value: filterData.query.value,
            label: i18n.global.t('governance.accessRequest.requestId'),
            class: 'mb-4',
            testid: 'request-query',
          },
        },
        {
          id: 'requester',
          component: FrField,
          props: {
            name: 'requester',
            value: filterData.requester.value,
            label: i18n.global.t('governance.accessRequest.requester'),
            class: 'mb-4',
          },
        },
        {
          id: 'user',
          component: FrField,
          props: {
            name: 'user',
            value: filterData.user.value,
            label: i18n.global.t('governance.accessRequest.requestee'),
            class: 'mb-4',
          },
        },
      ],
    },
  };
}

/**
 * Returns initial filter data for the task filter (status, priorities, query, assignee).
 * @param {string} defaultStatus - The default status value.
 * @returns {Object} initial task filter data
 */
export function getInitialTaskFilterData(defaultStatus) {
  return {
    status: {
      value: defaultStatus,
    },
    priorities: {
      value: {
        high: true,
        medium: true,
        low: true,
        none: true,
      },
    },
    query: {
      value: '',
    },
    assignee: {
      value: '',
    },
  };
}

/**
 * Builds the filter config for the task filter panel (status, priorities, query, assignee).
 * @param {Object} components - Vue component references: { BFormRadioGroup, FrPriorityFilter, FrField }
 * @param {Object} options - { statusOptions, filterData }
 * @returns {Object} task filter config
 */
export function getTaskFilterConfig(components, options) {
  const { BFormRadioGroup, FrPriorityFilter, FrField } = components;
  const { statusOptions, filterData } = options;

  return {
    status: {
      name: i18n.global.t('governance.access.filter.status'),
      components: [
        {
          id: 'statuses',
          component: BFormRadioGroup,
          props: {
            value: filterData.status.value,
            stacked: true,
            class: 'mr-2',
            options: statusOptions,
            label: i18n.global.t('governance.access.filter.status'),
            name: 'status',
          },
        },
      ],
    },
    priorities: {
      name: i18n.global.t('governance.accessRequest.priorities.priorities'),
      components: [
        {
          id: 'priorities',
          component: FrPriorityFilter,
          props: {
            name: 'priorities',
            value: filterData.priorities.value,
            class: 'mb-4 mt-2',
          },
        },
      ],
    },
    requestDetails: {
      name: i18n.global.t('governance.accessRequest.requestDetails'),
      components: [
        {
          id: 'query',
          component: FrField,
          props: {
            name: 'query',
            value: filterData.query.value,
            label: i18n.global.t('governance.accessRequest.requestId'),
            class: 'mb-4',
            testid: 'request-query',
          },
        },
        {
          id: 'assignee',
          component: FrField,
          props: {
            name: 'assignee',
            value: filterData.assignee.value,
            label: i18n.global.t('governance.tasks.assignedTo'),
            class: 'mb-4',
          },
        },
      ],
    },
  };
}
