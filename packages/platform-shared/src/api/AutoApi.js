/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAutoAccessReports } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '../utils/encodeQueryString';
import store from '@/store';

const versionedPayload = { version: 'v2' };

const getRealmContext = () => (
  [
    {
      type: 'global',
      data: [
        {
          key: 'realm',
          value: store.state.realm,
        },
      ],
    },
  ]);

/**
  * Returns a list of report templates
  * @param {Object} params Additional query parameters to be encoded
  *
  * @returns {Object}
  */
export async function getReportTemplates(params, underscores = true) {
  const { data } = await generateAutoAccessReports().get(`templates${encodeQueryString(params, underscores)}`);
  return data;
}

/**
  * Returns a list of report runs
  * @param {Object} params Additional query parameters to be encoded
  * @param {Boolean} appendUnderscores If perameters get an underscore appended
  *
  * @returns {Object}
  */
export async function getReportRuns(params, appendUnderscores = false) {
  const { data } = await generateAutoAccessReports().get(`runs${encodeQueryString(params, appendUnderscores)}`);
  return data;
}

/**
  * Returns a list report filter operators
  *
  * @returns {Object}
  */
export async function getReportOperators() {
  const { data } = await generateAutoAccessReports().get('operators');
  return data;
}

/**
  * Returns a list report aggregate types
  *
  * @returns {Object}
  */
export async function getAggregateTypes() {
  const { data } = await generateAutoAccessReports().get('aggregates');
  return data;
}

/**
  * Triggers an export / download request
  * @param {String} runId Report ID
  * @param {Object} params Additional query parameters to be encoded
  * @param {Boolean} appendUnderscores If perameters get an underscore appended
  *
  * @returns {Promise}
  */
export function reportExportRequest(runId, params, appendUnderscores = false) {
  return generateAutoAccessReports().post(`runs/${runId}${encodeQueryString(params, appendUnderscores)}`);
}

/**
 * Posts a run report request
 *
 * @param {String} template Name of the template
 * @param {String} state State of the template being ran (draft or published)
 * @param {Object} payload run report payload
 * @returns {Object} Contains job id, status, and status message
 */
export async function runAnalyticsTemplate(template, state, payload) {
  const { data: res } = await generateAutoAccessReports().post(`templates/${template}?_action=run&templateType=${state}`, {
    parameters: JSON.stringify(payload),
    context: getRealmContext(),
  });
  return res;
}

/**
 * Gets a list of report entities
 *
 * @param {String} path optional path for retrieving related entities
 * @returns {Promise<Object>}
 */
export function getReportEntities(path) {
  const queryParams = new URLSearchParams({ realm: store.state.realm });
  if (path) {
    queryParams.set('path', path);
  }
  return generateAutoAccessReports().get(`entities?${queryParams.toString()}`);
}

/**
 * Gets a list of entity field options from an existing report entity
 *
 * @param {Object} payload entities and fields
 * @returns {Promise<Object>}
 */
export function getReportFieldOptions(payload) {
  return generateAutoAccessReports().post('fieldoptions', {
    query: JSON.stringify({ ...versionedPayload, ...payload }),
    context: getRealmContext(),
  });
}

/**
 * Gets a list of report parameter types
 *
 * @returns {Promise}
 */
export function getReportParameterTypes(params = '') {
  return generateAutoAccessReports().get(`parameters/types${params}`);
}

/**
  * Gets the result of a Report Run.
  * @param {String} id Job ID of the report run.
  * @param {String} template Name of the report template.
  * @param {String} state State of the report (draft or published)
  * @param {Number} pageSize How many results to show per page
  * @param {Number} pageResultsOffset How many results to offset by.
  * @returns {Object} Contains count of results and array of results.
  */
export async function getReportResult(id, template, state, pageSize = 20, pagedResultsOffset = 0) {
  const params = {
    _action: 'view',
    _pageSize: pageSize,
    _pagedResultsOffset: pagedResultsOffset,
    name: template,
    templateType: state,
  };
  const { data } = await generateAutoAccessReports().post(`runs/${id}${encodeQueryString(params, false)}`);
  return data;
}

/**
 * Grabs an authorization token from indexedDB for fetch API usage.
 * NOTE: This is a one-off exception for handling a custom
 * fetch API request since axios was not returning the
 * correct data type for an arraybuffer response for a POST.
 * @param {String} baseURL url for targetting token scope
 * @returns {Promise}
 */
function getToken(baseURL) {
  const dbReq = window.indexedDB.open('appAuth');
  return new Promise((resolve, reject) => {
    dbReq.onerror = (dbError) => {
      reject(dbError);
    };
    dbReq.onsuccess = (dbResponse) => {
      const db = dbResponse.target.result;
      const dbStoreName = store.state.SharedStore.currentPackage === 'admin' ? 'Primary' : 'endUserUIClient';
      const objectStoreRequest = db.transaction([dbStoreName], 'readonly').objectStore(dbStoreName).get('tokens');

      objectStoreRequest.onsuccess = (objectStoreResponse) => {
        resolve(objectStoreResponse.target.result[baseURL]);
      };
    };
  });
}

/**
 * Downloads a report file.
 * Axios would not handle an arraybuffer response from a POST,
 * so it was neccessary to write a custom fetch API function.
 * @param {String} runId Report job run ID
 * @param {Object} params url params
 * @returns {Promise}
 */
export async function fetchDownload(runId, params) {
  const baseURL = store.state.SharedStore.autoAccessReportsUrl;
  const path = `runs/${runId}${encodeQueryString(params, false)}`;
  const token = await getToken(baseURL);

  return fetch(`${baseURL}/${path}`, {
    method: 'POST',
    headers: {
      'X-TENANT-ID': store.state.SharedStore.autoAccessTenantId,
      'Accept-API-Version': 'resource=1.0',
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
  * Exports or download a report in JSON or CSV format.
  * @param {String} template Name of the report template.
  * @param {String} id Job ID of the report run.
  * @param {String} action Action to execute, can be export or download.
  * @param {String} format Format of the report to be exported.
  * @returns {Object} Contains the data to be placed in a download file.
  */
export function exportReport(template, id, action, format) {
  const params = {
    _action: action,
    name: template,
    format,
  };

  if (action === 'export') {
    return generateAutoAccessReports().post(`runs/${id}${encodeQueryString(params, false)}`);
  }
  return fetchDownload(id, params);
}

/**
 * Gets a run report result
 *
 * @param {String} userName Platform user's username
 * @param {Array} dateRange Array containing the start date (index 0) and end date (index 1)
 * @param {String} template Name of the template
 * @param {Number} numberOfItems Number of results
 * @param {Boolean} isEnableUsers True for the request on a specific user, false for a request of the tenant only
 * @param {Boolean} isEnableAll True for the request on the teant, false for a request of a user
 * @returns {Object} Contains report count results, and array of results
 */
export async function getAutoAccessReportResult(userName, dateRange, template, numberOfItems = 2, isEnableUsers = true, isEnableAll = false) {
  const params = {
    userName, startDate: dateRange[0], endDate: dateRange[1], numberOfItems, enable_users: isEnableUsers, enable_all: isEnableAll,
  };

  const { id, status } = await runAnalyticsTemplate(template, 'published', params);
  if (!status === 'COMPLETED_SUCCESS') {
    throw new Error(status);
  }
  const { data: res } = await generateAutoAccessReports().post(`runs/${id}?_action=view&name=${template}`);
  return res;
}

/**
 * Create a report template
 *
 * @param {String} name report template name
 * @param {Object} payload report template attributes
 * @param {Array} viewers report template viewers
 * @param {String} description report template description
 * @returns {Promise<Object>}
 */
export function saveAnalyticsReport(name, payload, viewers, description = '') {
  return generateAutoAccessReports().post('templates?_action=create&templateType=draft', {
    reportTemplate: {
      name,
      description,
      viewers,
      reportConfig: JSON.stringify({ ...versionedPayload, ...payload }),
    },
  });
}

/**
 * Publish report template
 *
 * @param {String} id template name
 * @returns {Promise<Object>}
 */
export function publishAnalyticsReport(id) {
  return generateAutoAccessReports().post(`templates/${id}?_action=publish`);
}

/**
 * Edit report template
 *
 * @param {String} id template name
 * @returns {Promise<Object>}
 */
export function editAnalyticsReport(id) {
  return generateAutoAccessReports().post(`templates/${id}?_action=edit`);
}

/**
 * Delete report template
 *
 * @param {String} id template name
 * @param {String} templateType template state (draft, published)
 * @returns {Promise<Object>}
 */
export function deleteAnalyticsReport(id, templateType) {
  return generateAutoAccessReports().post(`templates/${id}?_action=delete&templateType=${templateType}`);
}

/**
 * Duplicate report template
 *
 * @param {Object} payload template payload
 * @returns {Promise<Object>}
 */
export function duplicateAnalyticsReport(payload) {
  const {
    description,
    name,
    originalReportName,
    viewers,
    status,
  } = payload;

  // We replace all spaces with dashes. This is a requirement of the backend.
  const apiFormattedReportName = name.replaceAll(' ', '-').toUpperCase();

  return generateAutoAccessReports().post(`templates/${originalReportName}?_action=duplicate&templateType=${status}`, {
    reportTemplate: {
      description,
      name: apiFormattedReportName,
      viewers,
    },
  });
}
