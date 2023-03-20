/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';

const governanceBaseUrl = '/governance';
const governanceCertificationBaseUrl = `${governanceBaseUrl}/certification`;
const governanceCertificationItemsUrl = `${governanceCertificationBaseUrl}/items`;
const governanceUserUrl = `${governanceBaseUrl}/user`;

/**
 * Returns the certification items
 * @param {object} params - Optional parameters to be plugged into query string
 * @returns {Promise}
 */
export function getCertificationItems(params) {
  const queryParams = new URLSearchParams(params).toString();
  const resourceUrl = `${governanceCertificationItemsUrl}?${queryParams}`;
  return generateIgaApi().get(resourceUrl);
}

/**
 * Get list of task proxies (delgates) for a given user
 * @param {String} userId - id of user to retrieve proxies for
 * @param {object} params - parameters to filter the list of proxies
 * @returns {Promise}
 */
export function getTaskProxies(userId, params) {
  const queryString = new URLSearchParams(params).toString();
  return generateIgaApi().get(`${governanceUserUrl}/${userId}/get-proxies?${queryString}`);
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
  const queryString = new URLSearchParams(params).toString();
  return generateIgaApi().get(`${governanceUserUrl}/${userId}/get-direct-reports?${queryString}`);
}
