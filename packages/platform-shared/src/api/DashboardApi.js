/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAmApi } from './BaseApi';

function getPath(realm) {
  if (realm && realm !== 'root' && realm !== '/') {
    return `realms/root/realms/${realm}`;
  }
  return '';
}

function getHeaders(realm) {
  return {
    path: getPath(realm),
    apiVersion: 'protocol=1.0,resource=1.0',
  };
}

/**
 * Retrieves a specific dashboard available in the authenticated user's realm.
 *
 * @returns {Promise}
 */
export function getDashboard(realm, dashboardName) {
  return generateAmApi(getHeaders(realm)).get(
    `/global-config/services/dashboard/instances/${dashboardName}`,
    { withCredentials: true },
  );
}

/**
 * Retrieves the list of dashboards available in the authenticated user's realm.
 *
 * @returns {Promise}
 */
export function getDefinedDashboards(realm) {
  return generateAmApi(getHeaders(realm)).get(
    '/dashboard/defined',
    { withCredentials: true },
  );
}

/**
 * Retrieves the list of globally defined dashboards.
 *
 * @returns {Promise}
 */
export function getGlobalDashboards(queryFilter = 'true') {
  return generateAmApi(getHeaders()).get(
    `/global-config/services/dashboard/instances?_queryFilter=${queryFilter}`,
    { withCredentials: true },
  );
}

/**
* Post dashboard into store
*
* @returns {Promise} API promise with result from put
*/
export function postDashboard(dashboard) {
  return generateAmApi(
    getHeaders(),
  ).post('/global-config/services/dashboard/instances?_action=create', dashboard);
}

/**
* Put dashboard into store
*
* @returns {Promise} API promise with result from put
*/
export function putDashboard(dashboardName, config) {
  return generateAmApi(getHeaders()).put(`/global-config/services/dashboard/instances/${dashboardName}`, config);
}

/**
* Delete dashboard from store
*
* @returns {Promise} API promise with result from delete
*/
export function deleteDashboard(dashboard) {
  return generateAmApi(getHeaders()).delete(`/global-config/services/dashboard/instances/${dashboard}`);
}
