/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAutoAccessReports } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '../utils/encodeQueryString';
import store from '@/store';

/**
  * Returns a list of report templates
  * @param {Object} params Additional query parameters to be encoded
  *
  * @returns {Promise}
  */
export async function getReportTemplates(params) {
  const { data } = await generateAutoAccessReports().get(`templates${encodeQueryString(params)}`);
  return data;
}

/**
  * Returns a list of report runs
  * @param {Object} params Additional query parameters to be encoded
  * @param {Boolean} appendUnderscores If perameters get an underscore appended
  *
  * @returns {Promise}
  */
export async function getReportRuns(params, appendUnderscores = false) {
  const { data } = await generateAutoAccessReports().get(`runs${encodeQueryString(params, appendUnderscores)}`);
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
 * @param {Object} payload run report payload
 * @returns {Object} Contains job id, status, and status message
 */
export async function runAnalyticsTemplate(template, payload) {
  const { data: res } = await generateAutoAccessReports().post(`templates/${template}?_action=run`, {
    parameters: JSON.stringify(payload),
  });
  return res;
}

/**
  * Gets the result of a Report Run.
  * @param {String} id Job ID of the report run.
  * @param {String} template Name of the report template.
  * @returns {Object} Contains count of results and array of results.
  */
export async function getReportResult(id, template, pageSize = 20, pagedResultsOffset = 0) {
  const params = {
    _action: 'view',
    _pageSize: pageSize,
    _pagedResultsOffset: pagedResultsOffset,
    name: template,
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
  * @param {String} id Job ID of the report run.
  * @param {String} template Name of the report template.
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

  const { id, status } = await runAnalyticsTemplate(template, params);
  if (!status === 'COMPLETED_SUCCESS') {
    throw new Error(status);
  }
  const { data: res } = await generateAutoAccessReports().post(`runs/${id}?_action=view&name=${template}`);
  return res;
}
