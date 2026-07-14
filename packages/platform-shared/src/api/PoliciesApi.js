/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import createRealmPath from '@forgerock/platform-shared/src/utils/createRealmPath';
import { generateAmApi } from '@forgerock/platform-shared/src/api/BaseApi';

function authorizationPolicyApiConfig(realm) {
  const realmPath = createRealmPath(realm);
  const path = realmPath ? `realms/root/${realmPath}/policies` : 'realms/root/policies';
  return {
    path,
    apiVersion: 'protocol=1.0,resource=2.0',
  };
}

function amGroupApiConfig(realm) {
  const realmPath = createRealmPath(realm);
  const path = realmPath ? `realms/root/${realmPath}/groups` : 'realms/root/groups';
  return {
    path,
    apiVersion: 'protocol=2.1,resource=4.0',
  };
}

/**
 * Lists AM policies
 * @param {String} realm Realm name
 * @param {String} queryFilter Query filter string
 * @returns {Promise} Resolves with a list of policy objects
 */
export function listAuthorizationPolicies(realm, queryFilter = 'true') {
  return generateAmApi(authorizationPolicyApiConfig(realm)).get(
    '/',
    {
      withCredentials: true,
      params: {
        _queryFilter: queryFilter,
        _fields: 'name,description,subject,resourceAttributes',
        withCredentials: true,
      },
    },
  );
}

/**
 * Creates a new AM policy on the 'customerApplicationPolicySet' policy set
 * @param {String} realm Realm name
 * @param {*} payload Policy object to create
 */
export function createAuthorizationPolicy(realm, payload) {
  return generateAmApi(authorizationPolicyApiConfig(realm)).post(
    '/?_action=create',
    payload,
    { withCredentials: true },
  );
}

/**
 * Deletes an existing AM policy on the 'customerApplicationPolicySet' policy set
 * @param {String} realm Realm name
 */
export function deleteAuthorizationPolicy(realm, policyName) {
  return generateAmApi(authorizationPolicyApiConfig(realm)).delete(
    `/${policyName}`,
    { withCredentials: true },
  );
}

/**
 * Returns an object containing a policy attached to specified application
 * @param {String} realm Realm name
 * @param {String} appName Application name
 * @returns {Promise} Resolves with an individual policy object
 */
export function getAuthorizationPolicy(realm, appName) {
  return generateAmApi(authorizationPolicyApiConfig(realm)).get(
    `/${appName}`,
    { withCredentials: true },
  );
}

/**
 * Updates an existing AM policy
 * @param {*} realm Realm name
 * @param {*} appName Application name
 * @param {*} payload Policy object to update
 * @returns {Promise} Resolves with an individual policy object
 */
export function updateAuthorizationPolicy(realm, appName, payload) {
  return generateAmApi(authorizationPolicyApiConfig(realm)).put(
    `/${appName}`,
    payload,
    { withCredentials: true },
  );
}

/**
 * Evaluates a policy tree
 * @param {String} realm Realm name
 * @param {*} payload Policy tree to evaluate
 * @param {Boolean} routeToForbidden Whether to redirect to forbidden page on 403
 * @returns {Promise} Resolves with an array of policy objects
 */
export function evaluateAuthorizationPolicy(realm, payload, routeToForbidden = true) {
  return generateAmApi(authorizationPolicyApiConfig(realm), {}, routeToForbidden).post(
    '/?_action=evaluateTree',
    payload,
    { withCredentials: true },
  );
}

/**
 * Lists AM groups
 * @param {String} realm Realm name
 * @param {String} queryFilter Query filter string
 * @param {Number} pageSize Number of results per page
 * @returns {Promise} Resolves with a list of group objects
 */
export function listAmGroups(realm, queryFilter = 'true', pageSize = 20) {
  return generateAmApi(amGroupApiConfig(realm)).get(
    '/',
    {
      withCredentials: true,
      params: {
        _queryFilter: queryFilter,
        _pageSize: pageSize,
      },
    },
  );
}

/**
 * Returns an AM group by name
 * @param {String} realm Realm name
 * @param {String} groupName Group name
 * @returns {Promise} Resolves with a group object
 */
export function getAmGroup(realm, groupName) {
  return generateAmApi(amGroupApiConfig(realm)).get(
    `/${groupName}`,
    { withCredentials: true },
  );
}

/**
 * Updates an existing AM group
 * @param {String} realm Realm name
 * @param {String} groupName Group name
 * @param {*} payload Group object to update
 * @returns {Promise} Resolves with the updated group object
 */
export function updateAmGroup(realm, groupName, payload) {
  return generateAmApi(amGroupApiConfig(realm)).put(
    `/${groupName}`,
    payload,
    { withCredentials: true },
  );
}
