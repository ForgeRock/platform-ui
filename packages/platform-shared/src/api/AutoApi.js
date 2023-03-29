/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAutoAccessReports } from '@forgerock/platform-shared/src/api/BaseApi';

/**
 * Gets the Normal View behavior data
 *
 * @param {string} userName Platform user's username
 * @param {array} dateRange Array containing the start date (index 0) and end date (index 1)
 * @param {string} template Name of the template
 * @param {number} numberOfItems Number of results
 * @param {boolean} isEnableUsers True for the request on a specific user, false for a request of the tenant only
 * @param {boolean} isEnableAll True for the request on the teant, false for a request of a user
 * @returns {object} Contains job id, status, and status message
 */
export async function runAutoAccessTemplate(username, dateRange, template, numberOfItems, isEnableUsers, isEnableAll) {
  const { data: res } = await generateAutoAccessReports().post(`templates/${template}?_action=run`, {
    parameters: `{"userName":"${username}","startDate":"${dateRange[0]}","endDate":"${dateRange[1]}","numberOfItems":${numberOfItems},"enable_users":${isEnableUsers},"enable_all":${isEnableAll}}`,
  });
  return res;
}

/**
 * Gets the Normal View behavior data
 *
 * @param {string} userName Platform user's username
 * @param {array} dateRange Array containing the start date (index 0) and end date (index 1)
 * @param {string} template Name of the template
 * @param {number} numberOfItems Number of results
 * @param {boolean} isEnableUsers True for the request on a specific user, false for a request of the tenant only
 * @param {boolean} isEnableAll True for the request on the teant, false for a request of a user
 * @returns {object} Contains report count results, and array of results
 */
export async function getAutoAccessReportResult(username, dateRange, template, numberOfItems = 2, isEnableUsers = true, isEnableAll = false) {
  const { id, status } = await runAutoAccessTemplate(username, dateRange, template, numberOfItems, isEnableUsers, isEnableAll);
  if (!status === 'COMPLETED_SUCCESS') {
    throw new Error(status);
  }
  const { data: res } = await generateAutoAccessReports().post(`runs/${id}?_action=view&name=${template}`);
  return res;
}
