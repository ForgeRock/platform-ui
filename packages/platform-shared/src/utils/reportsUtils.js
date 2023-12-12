/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getReportRuns, reportExportRequest } from '@forgerock/platform-shared/src/api/AutoApi';
import { actionGetAllTrees } from '@forgerock/platform-shared/src/api/TreeApi';
import { getGatewaysOrAgents } from '@forgerock/platform-shared/src/api/AgentsApi';
import i18n from '@forgerock/platform-shared/src/i18n';
import store from '@/store';

/**
 * Gets the supplied managed object from the config
 *
 * @param {String} managedObjectName managed object name that comes from the _FIELD_MAP config
 * @param {String} errorMessage the error message to show if call fails
 * @returns {Object} managed object
 */
async function getManagedObject(managedObjectName, errorMessage) {
  function findManagedObject(objects, name) {
    return objects.find((object) => (!store.state.isFraas || object.name.startsWith(store.state.realm)) && object.name.endsWith(name));
  }

  try {
    const { data: managedConfig } = await getConfig('managed');
    const { objects } = managedConfig;
    return findManagedObject(objects, managedObjectName);
  } catch (error) {
    showErrorMessage(error, errorMessage);
    return error;
  }
}

/**
 * Gets the managed schema
 *
 * @param {String} resourceName managed object name
 * @param {String} errorMessage the error message to show if call fails
 * @returns {Object} managed schema
 */
async function getManagedSchema(resourceName, errorMessage) {
  const schemaUrl = `managed/${resourceName}`;
  try {
    const { data: schema } = await getSchema(schemaUrl);
    return schema;
  } catch (error) {
    showErrorMessage(error, errorMessage);
    return error;
  }
}

/**
 * Gets managed object properties
 *
 * @param {String} managedObjectName the managed object name that derives from the _FIELD_MAP config
 * @returns {Array} list of managed object property names
 */
async function getManagedResourceProperties(managedObjectName, queryFilter = true, pageSize = -1, fields = '') {
  const { name: resourceName } = await getManagedObject(managedObjectName);

  try {
    const { data } = await getManagedResourceList(resourceName, { queryFilter, pageSize, fields });
    const managedResourceProperties = data.result;
    return managedResourceProperties;
  } catch (error) {
    showErrorMessage(error, i18n.global.t('reports.tabs.runReport.errors.errorRetrievingTemplate'));
    return error;
  }
}

/**
 * Gets a list of only oAuth2 clients
 * @param {Undefined} _ Unused first parameter
 * @param {String} queryFilter api parameter for filtering results
 * @param {String} pageSize api parameter for returning a determined amount of results
 */
export async function getOauth2Clients(_, queryFilter = true, pageSize = 10) {
  const queryFilterForGatewaysOrAgents = queryFilter === true ? '' : queryFilter.split('"')[1];
  const response = await getGatewaysOrAgents('oauth2', { queryFilter: queryFilterForGatewaysOrAgents }, pageSize);
  return response.data.result;
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
 * @returns {Array}
 */
export async function requestReportRuns(params) {
  try {
    const { result: reportRunsData } = await getReportRuns(params);
    return reportRunsData?.length ? reportRunsData : [];
  } catch (error) {
    showErrorMessage(error, i18n.global.t('reports.tabs.runHistory.errors.errorRetrievingHistory'));
    return [];
  }
}

/**
 * Gets the managed object and schema and sets properties to corresponding element
 * @param {Object} config the _REPORT_FIELDS_CONTROLLER config for the corresponding reportConfig paremeter
 * @returns {Object} managed schema property
 */
export async function relationshipPropertyRequest(config) {
  const { managedObject, schemaProperty } = config;
  const { name: resourceName } = await getManagedObject(managedObject, i18n.global.t('reports.tabs.runReport.errors.errorRetrievingTemplate'));
  const { properties } = await getManagedSchema(resourceName, i18n.global.t('reports.tabs.runReport.errors.errorRetrievingTemplate'));
  return properties[schemaProperty];
}

/**
 * Gets managed object properties and sets them to corresponding data model
 * @param {Object} config the _REPORT_FIELDS_CONTROLLER config for the corresponding reportConfig paremeter
 * @param {String} queryFilter api parameter for filtering results
 * @param {String} pageSize api parameter for returning a determined amount of results
 * @returns {Array} list of managed object property names
 */
export function managedResourcePropertyRequest(config, queryFilter, pageSize) {
  const { managedObject, fields } = config;
  return getManagedResourceProperties(managedObject, queryFilter, pageSize, fields);
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
    const { data } = await actionGetAllTrees(config.fields, queryFilter, pageSize);
    const trees = data.result;
    return trees;
  } catch (error) {
    showErrorMessage(error, i18n.t('reports.tabs.runReport.errors.errorRetrievingTemplate'));
    return error;
  }
}
