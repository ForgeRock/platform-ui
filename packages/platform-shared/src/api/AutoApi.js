/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAutoAccessReports } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '../utils/encodeQueryString';

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
  *
  * @returns {Promise}
  */
export async function getReportRuns(params) {
  const { data } = await generateAutoAccessReports().get(`reports/runs${encodeQueryString(params)}`);
  return data;
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
