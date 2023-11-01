/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import { getSchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { getReportRuns, reportExportRequest } from '@forgerock/platform-shared/src/api/AutoApi';
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
async function getManagedResourceProperties(managedObjectName) {
  const { name: resourceName } = await getManagedObject(managedObjectName);

  try {
    const { data } = await getManagedResourceList(resourceName, { queryFilter: true });
    const managedResourceProperties = data.result;
    return managedResourceProperties;
  } catch (error) {
    showErrorMessage(error, i18n.t('reports.tabs.runReport.errors.errorRetrievingTemplate'));
    return error;
  }
}

/**
 * Gets the list of all trees
 * @param {Function} actionGetAllTrees api function needs to be passed in because utils located under admin package
 * @returns {Array} list of trees
 */
async function getTrees(actionGetAllTrees) {
  try {
    const { data } = await actionGetAllTrees();
    const trees = data.result;
    return trees;
  } catch (error) {
    showErrorMessage(error, i18n.t('reports.tabs.runReport.errors.errorRetrievingTemplate'));
    return error;
  }
}

/**
 * Requests a report export file or a download
 * @param {String} runId Report job run ID
 * @param {String} exportStatus Report status: 'export' || 'download'
 * @param {String} template Report name
 * @param {String} format File type: jsonl || csv
 */
export async function requestExport(runId, exportStatus, template, format) {
  try {
    const response = await reportExportRequest(runId, {
      _action: exportStatus,
      name: template,
      format,
    });
    return response;
  } catch (error) {
    if (exportStatus === 'download') {
      showErrorMessage(error, i18n.t('reports.tabs.runHistory.errors.errorDownload'));
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
    showErrorMessage(error, i18n.t('reports.tabs.runHistory.table.runHistory.errors.errorRetrievingHistory'));
    return [];
  }
}

/**
 * Gets the managed object and schema and sets properties to corresponding element
 * @param {Object} config the _REPORT_FIELDS_CONTROLLER config for the corresponding reportConfig paremeter
 * @returns {Object} managed schema property
 */
export async function relationshipPropertyRequest(config) {
  const { schemaProperty, managedObject } = config;
  const { name: resourceName } = await getManagedObject(managedObject, i18n.t('reports.tabs.runReport.errors.errorRetrievingTemplate'));
  const { properties } = await getManagedSchema(resourceName, i18n.t('reports.tabs.runReport.errors.errorRetrievingTemplate'));
  return properties[schemaProperty];
}

/**
 * Gets managed object properties and sets them to corresponding data model
 * @param {Object} config the _REPORT_FIELDS_CONTROLLER config for the corresponding reportConfig paremeter
 * @returns {Array} list of managed object property names
 */
export async function managedResourcePropertyRequest(config) {
  const { managedObject } = config;
  const properties = await getManagedResourceProperties(managedObject);
  const propertyNames = properties.map(({ name }) => name);
  return propertyNames;
}

/**
 * Gets the list of all trees and sets them to the model
 * @param {Object} model the data model where the tree options get injected
 * @returns {Array} list of tree names
 */
export async function requestTrees(actionGetAllTrees) {
  const trees = await getTrees(actionGetAllTrees);

  if (trees.length) {
    const treeNames = trees.map(({ _id }) => _id);
    return treeNames;
  }
  return [];
}
