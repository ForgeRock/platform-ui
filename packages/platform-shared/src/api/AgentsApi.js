/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { each } from 'lodash';
import { generateAmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import apiUtils from '@forgerock/platform-shared/src/api/utils/apiUtils';

const getAgentsApiOverrides = (realm, resourceVersion = '1.0') => {
  const configPath = realm?.length
    ? apiUtils.getRealmConfigPath(realm) : apiUtils.getCurrentRealmConfigPath();
  return {
    path: `${configPath}/agents`,
    apiVersion: `protocol=2.1,resource=${resourceVersion}`,
  };
};

const agentTypeToApiTypeMap = {
  gateway: 'IdentityGatewayAgent',
  'java-agent': 'J2EEAgent',
  'web-agent': 'WebAgent',
  oauth2: 'OAuth2Client',
};

export const apiTypetoAgentTypeMap = {
  IdentityGatewayAgent: 'gateway',
  WebAgent: 'web-agent',
  J2EEAgent: 'java-agent',
};

const agentTypeToQueryFilterMap = {
  gateway: '_fields=status',
  'java-agent': '_fields=globalJ2EEAgentConfig/status',
  'web-agent': '_fields=globalWebAgentConfig/status',
  oauth2: '_fields='
  + 'coreOAuth2ClientConfig/status,'
  + 'advancedOAuth2ClientConfig/logoUri,'
  + 'coreOAuth2ClientConfig/clientType,'
  + 'coreOAuth2ClientConfig/clientName,'
  + 'advancedOAuth2ClientConfig/grantTypes,'
  + 'advancedOAuth2ClientConfig/responseTypes',
};

/**
  * Returns an object containing an array of configured gateways or agents
  *
  * @returns {Promise}
  */
export function getGatewaysOrAgents(agentType, params, pageSize = 10) {
  const pageSizeParam = agentType === 'oauth2' && pageSize ? `_pageSize=${pageSize}&` : '';
  let resourceUrl = `/${agentTypeToApiTypeMap[agentType]}?${pageSizeParam}${agentTypeToQueryFilterMap[agentType]}`;
  if (params) {
    each(params, (value, key) => {
      if (key !== 'queryFilter') {
        resourceUrl += `&_${key}=${value}`;
      } else if (value !== '') {
        resourceUrl += `&_${key}=_id+co+"${value}"`;
      }
    });
  }
  if (!params || params.queryFilter === undefined || params.queryFilter === '') {
    resourceUrl += '&_queryFilter=true';
  }

  return generateAmApi(getAgentsApiOverrides('', '2.0')).get(
    resourceUrl,
    { withCredentials: true },
  );
}

/**
  * Creates a gateway or agent, returning the config object defining the persisted item
  * @param {String} agentType the type of item
  * @param {String} id the id of the item being saved
  * @param {Object} payload the config object defining the item being saved
  * @param {String} realm the realm to perform the operation in
  *
  * @returns {Promise}
  */
export function createGatewayOrAgent(agentType, id, payload, realm) {
  const overrides = {
    headers: { 'if-none-match': '*' },
  };
  return generateAmApi(getAgentsApiOverrides(realm), overrides).put(
    `/${agentTypeToApiTypeMap[agentType]}/${id}`,
    payload,
    { withCredentials: true },
  );
}

/**
  * Updates a gateway or agent, returning the config object defining the persisted item
  * @param {String} agentType the type of item
  * @param {String} id the id of the item being saved
  * @param {Object} payload the config object defining the item being saved
  * @param {String} realm the realm to perform the operation in
  *
  * @returns {Promise}
  */
export function updateGatewayOrAgent(agentType, id, payload, realm) {
  const overrides = {
    headers: { 'if-match': '*' },
  };
  return generateAmApi(getAgentsApiOverrides(realm), overrides).put(
    `/${agentTypeToApiTypeMap[agentType]}/${id}`,
    payload,
    { withCredentials: true },
  );
}

/**
  * Returns the config object defining a persisted gateway or agent
  * @param {String} agentType the type of item
  * @param {String} id the id of the item being retrieved
  * @param {String} realm the realm to query for the item
  *
  * @returns {Promise}
  */
export function getGatewayOrAgent(agentType, id, realm) {
  return generateAmApi(getAgentsApiOverrides(realm)).get(
    `/${agentTypeToApiTypeMap[agentType]}/${id}`,
    { withCredentials: true },
  );
}

/**
  * Returns the json schema object gateways or agents of the supplied type
  * @param {String} agentType the type of item
  *
  * @returns {Promise}
  */
export function getGatewayOrAgentSchema(agentType) {
  return generateAmApi(getAgentsApiOverrides()).post(
    `${agentTypeToApiTypeMap[agentType]}?_action=schema`,
    {},
    { withCredentials: true },
  );
}

/**
  * Deletes a gateway or agent
  * @param {String} agentType the type of item to delete
  * @param {String} id the id of the item to delete
  *
  * @returns {Promise}
  */
export function deleteGatewayOrAgent(agentType, id) {
  return generateAmApi(getAgentsApiOverrides()).delete(
    `/${agentTypeToApiTypeMap[agentType]}/${id}`,
    { withCredentials: true },
  );
}
