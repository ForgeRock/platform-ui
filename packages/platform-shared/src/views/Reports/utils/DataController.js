/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  getAMTreesConfig,
  getCertificationsForReports,
  getGovernanceResource,
  getGovPolicyList,
  getGovPolicyRuleList,
  getOauth2Clients,
  getRequestTypesForReports,
  getTeamMembers,
  managedResourcePropertyRequest,
  requestTrees,
} from './ReportsApiHelper';

/**
 * @description Data controller object that maps the data source to the API
 * request. The deeper the level, the more priority it has over the parent
 * level. For example, if a parent level has a fetch function, but the child
 * level also has a fetch function, the child level fetch function will be used.
 *
 * { SERVICE } First Level is the datasource service name (AM, IDM, IGA).
 * { entity } Second Level is the data source entity name.
 * { attribute } Third Level is the data source entity property or attribute name.
 *
 * AVAILABLE PROPERTIES:
 * - fetch: The API request function to fetch the data.
 * - mutation: The function to transform the data.
 * - canQuery: Boolean to determine if the data can be queried.
 * - endUserCanFetch: Boolean to determine if the end user can fetch the data.
 * - taggable: Boolean to determine if the parameter field can be tagged.
 * - {*}: Additional properties can be added and will be injected into
 *   the parameter request object, which in-turn gets injected into the
 *   fetch function as the first argument.
 */

const DATA_CONTROLLER = Object.freeze({
  AM: {
    amconfig: {
      fetch: getAMTreesConfig,
      mutation: ({ suspendedAuthenticationTimeout: first, authenticationSessionsMaxDuration: second }) => Math.min(first, second),
    },
    trees: {
      fetch: requestTrees,
      canQuery: false,
    },
  },
  IDM: {
    fetch: managedResourcePropertyRequest,
    application: {},
    group: {},
    oauth2application: { fetch: getOauth2Clients },
    organization: {},
    role: {},
    teammember: { fetch: getTeamMembers },
    user: {},
  },
  IGA: {
    certification: { fetch: getCertificationsForReports },
    // Currently, IGA does not have the capability to query
    // the entitlements object directly, so the only way to
    // query entitlements is by "displayName" under the
    // "descriptor" object, and this is why "targetName"
    // and "sortBy" are hard-coded to point to "displayName".
    entitlement: {
      fetch: getGovernanceResource,
      mutation: (data, attribute) => data.map((obj) => obj.entitlement[attribute] || obj),
      body: (term = '') => ({
        targetFilter: {
          operator: 'CONTAINS',
          operand: {
            targetName: 'descriptor.idx./entitlement.displayName',
            targetValue: term,
          },
        },
      }),
      queryParameters: {
        pageNumber: 0,
        pageSize: 10,
        sortBy: 'descriptor.idx./entitlement.displayName',
        sortDir: 'asc',
      },
    },
    policy: { fetch: getGovPolicyList },
    request: { fetch: getRequestTypesForReports },
    rule: { fetch: getGovPolicyRuleList },
    violation: {},
  },
});

export default DATA_CONTROLLER;
