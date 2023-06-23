/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const governanceUserUrl = '/governance/user';

/**
 * Get list of task proxies (delgates) for a given user
 * @param {String} userId - id of user to retrieve proxies for
 * @param {object} params - parameters to filter the list of proxies
 * @returns {Promise}
 */
export function getTaskProxies(userId, params) {
  const queryString = encodeQueryString(params, false);
  return generateIgaApi().get(`${governanceUserUrl}/${userId}/get-proxies${queryString}`);
}

/**
 * Add task proxies (delegates) to a user
 * @param {String} userId - id of user to add proxies for
 * @param {String[]} taskProxies - array of resources to add as proxies e.g ['managed/user/${userID}']
 * @param {String} startDate - start of when proxy will be active - e.g '2023-02-10T18:13:49+00:00'
 * @param {String} endDate - end of when proxy will be active
 * @returns {Promise}
 */
export function addTaskProxy(userId, taskProxies, startDate, endDate) {
  const payload = {
    proxyIds: taskProxies,
  };

  if (startDate) payload.startDate = startDate;
  if (endDate) payload.endDate = endDate;

  return generateIgaApi().post(`${governanceUserUrl}/${userId}/set-proxy`, payload);
}

/**
 * delete task proxies (delegates from a user)
 * @param {String} userId - id of user to delete proxies for
 * @param {object} taskProxies - array of resources to remove as proxies e.g ['managed/user/${userID}']
 * @returns {Promise}
 */
export function deleteTaskProxy(userId, taskProxies) {
  return generateIgaApi().post(`${governanceUserUrl}/${userId}/remove-proxy`, { proxyIds: taskProxies });
}

/**
 * Get list of Direct Report for a given user
 * @param {String} userId - id of user to retrieve proxies for
 * @param {object} params - parameters to filter the list of direct reports
 * @returns {Promise}
 */
export async function getDirectReports(userId, params) {
  const queryString = encodeQueryString(params, false);
  return generateIgaApi().get(`${governanceUserUrl}/${userId}/get-direct-reports${queryString}`);
}

/**
 * Get user detail info after manager click from their dirct report row
 * @param {String} userId - current logged-in manager id
 * @param {String} reporteeId - id of the row that manager clicked in order to check the details
 * @returns {Promise}
 */
export function getDirectReportUserInfo(userId, reporteeId) {
  return generateIgaApi().get(`${governanceUserUrl}/${userId}/get-direct-reports/${reporteeId}`);
}
