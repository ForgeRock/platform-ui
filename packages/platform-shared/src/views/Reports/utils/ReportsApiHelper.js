/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getConfig, getAMConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getReportRuns, reportExportRequest } from '@forgerock/platform-shared/src/api/AutoApi';
import { actionGetAllTrees } from '@forgerock/platform-shared/src/api/TreeApi';
import { getGatewaysOrAgents } from '@forgerock/platform-shared/src/api/AgentsApi';
import { searchGovernanceResource } from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getPolicyList, getPolicyRuleList } from '@forgerock/platform-shared/src/api/governance/PolicyApi';
import { getCertificationTemplates } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import { getRequestTypes } from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';

import i18n from '@forgerock/platform-shared/src/i18n';
import store from '@/store';

/**
 * Gets a list of only oAuth2 clients
 * @param {Undefined} _ Unused first parameter
 * @param {String} term The search term to query.
 * @returns {Array} list of all oAuth2 clients
 */
export async function getOauth2Clients(_, term = '') {
  try {
    const response = await getGatewaysOrAgents('oauth2', { queryFilter: term }, 10);
    return response.data.result || [];
  } catch {
    return [];
  }
}

/**
 * Gets tenant admins
 * @param {Object} obj An object for the request query strings.
 * @param {String} obj.entity The entity to query.
 * @param {String} obj.attribute The attribute to query.
 * @param {String} term The search term to query.
 * @returns {Array} list of all team members
 */
export async function getTeamMembers({ entity, attribute }, term) {
  const queryFilter = term ? `${attribute} sw "${term}"` : true;
  try {
    const { data } = await getManagedResourceList(entity, { queryFilter, pageSize: 10, fields: attribute });
    return data.result || [];
  } catch {
    return [];
  }
}

/**
 * Requests a report export file or a download
 * @param {String} runId Report job run ID
 * @param {String} action Action to execute, can be 'export' or 'download'.
 * @param {String} template Report name
 * @param {String} format File type: jsonl || csv
 */
export async function requestExport(runId, action, template, format) {
  try {
    const response = await reportExportRequest(runId, {
      _action: action,
      name: template,
      format,
    });
    return response;
  } catch (error) {
    if (action === 'download') {
      showErrorMessage(error, i18n.global.t('reports.tabs.runHistory.errors.errorDownload'));
    }
    return error.name;
  }
}

/**
 * Gets report runs for the given report template name.
 * For all runs: { name }
 * For a single run: { runId, name }
 * @param {Object} params query params
 * @returns {Promise<Array>}
 */
export async function requestReportRuns(params) {
  try {
    const { result: reportRunsData } = await getReportRuns(params);
    return reportRunsData || [];
  } catch (error) {
    showErrorMessage(error, i18n.global.t('reports.tabs.runHistory.errors.errorRetrievingHistory'));
    return [];
  }
}

/**
 * Gets the supplied managed object from the config
 *
 * @param {String} managedObjectName managed object name that comes from the _FIELD_MAP config
 * @returns {Object} managed object
 */
async function getManagedObject(managedObjectName) {
  function findManagedObject(objects, name) {
    return objects.find((object) => (!store.state.isFraas || object.name.startsWith(store.state.realm)) && object.name.endsWith(name));
  }

  try {
    const { data: managedConfig } = await getConfig('managed');
    const { objects } = managedConfig;
    return findManagedObject(objects, managedObjectName) || {};
  } catch {
    return {};
  }
}

/**
 * Gets managed object properties
 *
 * @param {String} managedObjectName the managed object name used to query the resource
 * @returns {Array} list of managed object property names
 */
async function getManagedResourceProperties(managedObjectName, queryFilter = true, pageSize = -1, fields = '') {
  const { name: resourceName } = await getManagedObject(managedObjectName);

  if (!resourceName) {
    throw new Error(`Cannot find managed object: ${managedObjectName}`);
  }

  try {
    const { data } = await getManagedResourceList(resourceName, { queryFilter, pageSize, fields });
    return data.result || [];
  } catch {
    return [];
  }
}

/**
 * Gets managed object properties and sets them to corresponding data model
 * @param {Object} obj An object for the request query strings.
 * @param {String} obj.entity The entity to query.
 * @param {String} obj.attribute The attribute to query.
 * @param {String} term The search term to query.
 * @returns {Array} list of managed object property names
 */
export function managedResourcePropertyRequest({ entity, attribute }, term) {
  try {
    const queryFilter = term ? `${attribute} sw "${term}"` : true;
    return getManagedResourceProperties(entity, queryFilter, 10, attribute);
  } catch {
    return [];
  }
}

/**
 * Gets the list of all trees
 * @param {Object} config the _REPORT_FIELDS_CONTROLLER config for the corresponding reportConfig paremeter
 * @param {String} queryFilter api parameter for filtering results
 * @param {String} pageSize api parameter for returning a determined amount of results
 * @returns {Array} list of tree names
 */
export async function requestTrees(config, queryFilter, pageSize) {
  try {
    const { data } = await actionGetAllTrees(config.attribute, queryFilter, pageSize);
    return data.result || [];
  } catch {
    return [];
  }
}

/**
 * Gets a list of all certification template names
 * @param {Object} obj An object for the request query strings.
 * @param {String} obj.attribute The attribute to query.
 * @param {String} term The search term to query.
 * @returns {Array} List of governance certification templates
 */
export async function getCertificationsForReports({ attribute }, term) {
  try {
    const defaultParams = {
      queryString: term,
      pageSize: 10,
      pageNumber: 0,
      sortBy: attribute,
    };
    const { data } = await getCertificationTemplates(term, defaultParams);
    return data.result || [];
  } catch {
    return [];
  }
}

/**
 * Gets the Journey's config
 * @returns {Object} journey's config
 */
export async function getAMTreesConfig() {
  try {
    const { data } = await getAMConfig('authentication');
    return data.trees || [];
  } catch {
    return [];
  }
}

/**
 * Queries the governance resource
 * @param {Object} obj An object for the request payload.
 * @param {Function} obj.body Body function that takes in a string term.
 * @param {Object} obj.queryParameters Query parameters for the request.
 * @param {String} term The search term to query.
 * @returns {Array} List of governance resources
 */
export async function getGovernanceResource({ body, queryParameters }, term) {
  try {
    const { data } = await searchGovernanceResource(body(term), queryParameters);
    return data.result || [];
  } catch {
    return [];
  }
}

/**
 * Gets the list of governance entitlements
 * @param {Undefined} _ Unused first parameter
 * @param {String} term The search term to query.
 * @returns {Array} List of governance entitlements
 */
export async function getRequestTypesForReports(_, term) {
  try {
    const { data } = await getRequestTypes({}, term);
    return data.result || [];
  } catch {
    return [];
  }
}

/**
 * Gets the list of governance policies
 * @param {Object} obj An object for the request query strings.
 * @param {String} obj.attribute The attribute to query.
 * @param {String} term The search term to query.
 * @returns {Array} List of governance policies
 */
export async function getGovPolicyList({ attribute }, term) {
  const queryFilter = term ? `${attribute} sw "${term}"` : true;
  try {
    const { data } = await getPolicyList({ queryFilter, pageSize: 10 });
    return data.result || [];
  } catch {
    return [];
  }
}

/**
 * Gets the list of governance policy rules
 * @param {Object} obj An object for the request query strings.
 * @param {String} obj.attribute The attribute to query.
 * @param {String} term The search term to query.
 * @returns {Array} List of governance policy rules
 */
export async function getGovPolicyRuleList({ attribute }, term) {
  const queryFilter = term ? `${attribute} sw "${term}"` : true;
  try {
    const { data } = await getPolicyRuleList({ queryFilter, pageSize: 10 });
    return data.result || [];
  } catch {
    return [];
  }
}
