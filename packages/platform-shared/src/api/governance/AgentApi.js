/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIdmApi, generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const agentUrl = 'governance/agent';
const applicationUrl = 'governance/application';

/**
 * Get a list of agents.
 *
 * @param {Object} queryParams - The query parameters to include in the request.
 * @returns {Promise} - A promise that resolves to a list of agents.
 */
export function getAgentConfig() {
  return generateIgaApi().get(`${agentUrl}/config`);
}

export async function getAgents(queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${agentUrl}${encodedQueryParams}`);
}

/**
 * Get agent details for a single agent by ID.
 *
 * @param {string} id - The ID of the agent to retrieve.
 * @returns {Promise} A promise that resolves to the agent details.
 */
export function getAgentById(id) {
  return generateIgaApi().get(`${agentUrl}/${id}`);
}

/**
 * Fetch glossary attributes data for an agent.
 *
 * @param {string} agentId
 * @returns {Promise}
 */
export function getAgentGlossaryAttributesData(agentId) {
  return generateIgaApi().get(`${agentUrl}/${agentId}/glossary`);
}

/**
 * Save glossary attributes data for an agent.
 *
 * @param {string} agentId
 * @param {Object} payload - Object with all data of glossary attributes
 * @returns {Promise}
 */
export function saveAgentGlossaryAttributesData(agentId, payload) {
  return generateIgaApi().put(`${agentUrl}/${agentId}/glossary`, payload);
}

/**
 * Fetch grants for an agent by grant type.
 *
 * @param {string} agentId
 * @param {string} grantType - e.g. 'entitlement', 'account', 'role'
 * @param {Object} queryParams - The query parameters to include in the request
 * @returns {Promise}
 */
export function getAgentGrants(agentId, queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams);
  return generateIgaApi().get(`${agentUrl}/${agentId}/grants${encodedQueryParams}`);
}

/**
 * Get custodians for an agent.
 *
 * @param {string} agentId
 * @param {Object} queryParams - pageSize and pageNumber (plain params, not CREST-style)
 * @returns {Promise}
 */
export function getAgentCustodians(agentId, queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams, false);
  return generateIgaApi().get(`${agentUrl}/${agentId}/custodians${encodedQueryParams}`);
}

/**
 * Get resources of a specific type for an agent (e.g. guardrails, tools, knowledge).
 *
 * @param {string} agentId
 * @param {string} resourceType - resource type key (e.g. 'guardrails', 'tools')
 * @param {Object} queryParams - pageSize and pageNumber (plain params, not CREST-style)
 * @returns {Promise}
 */
export function getAgentResources(agentId, resourceType, queryParams = {}) {
  const encodedQueryParams = encodeQueryString(queryParams, false);
  return generateIgaApi().get(`${agentUrl}/${agentId}/resources/${resourceType}${encodedQueryParams}`);
}

/**
 * Get system resources for a connector and object type. Calls the IDM system API as a
 * placeholder for an in-progress IGA API, so it only works from platform-admin usage
 * of this shared component. pagedResultsCookie must not be encoded (it breaks if it is).
 * @param {String} connectorId ID of connector
 * @param {String} objectTypeName name of object type
 * @param {Object} params query params object (_queryFilter, _sortKeys, _fields, etc.)
 * @returns {Promise}
 */
async function getSystemResourceList(connectorId, objectTypeName, params) {
  let cookie = null;
  if (params._pagedResultsCookie) {
    cookie = params._pagedResultsCookie;
    delete params._pagedResultsCookie;
  }

  let encodedParams = encodeQueryString(params);
  // If a pagedResultsCookie is encoded, it will not work properly
  if (cookie !== null) {
    encodedParams = `${encodedParams}&_pagedResultsCookie=${cookie}`;
  }

  const resourceUrl = `/system/${connectorId}/${objectTypeName}${encodedParams}`;
  return generateIdmApi().get(resourceUrl);
}

/**
 * Get a single system resource. Calls the IDM system API as a placeholder for an
 * in-progress IGA API, so it only works from platform-admin usage of this shared component.
 * @param {String} connectorId ID of connector
 * @param {String} objectTypeName name of object type
 * @param {String} id system resource id
 * @returns {Promise}
 */
export function getSystemResource(connectorId, objectTypeName, id) {
  const resourceUrl = `system/${connectorId}/${objectTypeName}/${id}`;
  return generateIdmApi().get(resourceUrl);
}

/**
 * Given a connector, object type, and id list, fetch the matching system resources
 * @param {object} queryParams IDM query parameters
 * @param {string} connectorId ID of application connector
 * @param {string} objectType Object type ID
 * @param {Array} idList List of ids to fetch
 * @returns List of system resource objects
 */
async function getConnectorObjectsByIds(queryParams = {}, connectorId, objectType, idList) {
  const idFilter = idList.map((id) => `_id eq "${id}"`).join(' or ');
  const _queryFilter = idList.length > 0 ? idFilter : 'true';
  const updatedQueryParams = {
    ...queryParams,
    _queryFilter,
  };
  return getSystemResourceList(connectorId, objectType, updatedQueryParams);
}

/**
 * Given a disconnected application ID, object type, and id list, fetch the matching application resources
 * @param {object} queryParams IDM query parameters
 * @param {string} applicationId ID of application
 * @param {string} objectType Object type ID
 * @param {Array} idList List of ids to fetch
 * @returns List of application resource objects
 */
async function getApplicationObjectsByIds(queryParams = {}, applicationId, objectType, idList) {
  const idFilter = idList.map((id) => `id eq "${id}"`).join(' or ');
  const objectTypeFilter = `objectType eq "${objectType}"`;
  const _queryFilter = `${objectTypeFilter}${idList.length > 0 ? ` and (${idFilter})` : ''}`;
  const updatedQueryParams = {
    ...queryParams,
    _queryFilter,
  };
  const encodedQueryParams = encodeQueryString(updatedQueryParams);
  return generateIgaApi().get(`${applicationUrl}/${applicationId}/resources${encodedQueryParams}`);
}

/**
 * Given an application object, resource type, and id list, fetch the matching resources
 * @param {object} queryParams IDM query parameters
 * @param {object} application Application object
 * @param {string} resourceType Resource type ID
 * @param {Array} idList List of ids to fetch
 * @returns List of resource objects
 */
export async function getAgentResourcesByIds(queryParams = {}, application, resourceType, idList) {
  if (application.isDisconnected) {
    return getApplicationObjectsByIds(queryParams, application.id, resourceType, idList);
  }
  return getConnectorObjectsByIds(queryParams, application.connectorId, resourceType, idList);
}

/**
 * Fetch the discovery status (mapping list) for an agent application.
 * Returns 404 if no reconMapping task has been created yet.
 *
 * @param {string} applicationId
 * @returns {Promise} Array of mapping status objects
 */
export function getAgentDiscovery(applicationId) {
  return generateIgaApi().get(`${agentUrl}/discovery`, { params: { applicationId } });
}

/**
 * Schedule (upsert) a reconMapping discovery task for an agent application.
 *
 * @param {string} applicationId
 * @param {Object} [options]
 * @param {string} [options.date] - ISO date string for when to run; omit for immediate
 * @param {number} [options.intervalMs] - Recurring interval in ms
 * @param {boolean} [options.recurring]
 * @returns {Promise}
 */
export function createAgentDiscovery(applicationId, options = {}) {
  return generateIgaApi().post(`${agentUrl}/discovery?_action=create`, { applicationId, ...options });
}

/**
 * Immediately trigger the existing reconMapping task for an agent application.
 *
 * @param {string} applicationId
 * @param {Object} [options]
 * @param {boolean} [options.preserveDate]
 * @param {Object} [options.overrides]
 * @returns {Promise}
 */
export function triggerAgentDiscovery(applicationId, options = {}) {
  return generateIgaApi().post(`${agentUrl}/discovery?_action=trigger`, { applicationId, ...options });
}

/**
 * Given an application object, resource type, and id, fetch the matching resource
 * @param {object} application Application object
 * @param {string} resourceType Resource type ID
 * @param {string} id ID of the resource to fetch
 * @returns {Promise} Resource object
 */
export async function getAgentResourceById(application, resourceType, id) {
  if (application.isDisconnected) {
    const response = await getApplicationObjectsByIds({}, application.id, resourceType, [id]);
    return {
      ...response,
      data: response?.data?.result?.[0],
    };
  }
  return getSystemResource(application.connectorId, resourceType, encodeURIComponent(id));
}
