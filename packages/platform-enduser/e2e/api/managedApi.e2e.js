/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export function addRoleMember(roleId, userId, resourceType = 'internal') {
  const accessToken = Cypress.env('ACCESS_TOKEN').access_token;
  let requestResourceType;
  if (resourceType === 'internal') {
    requestResourceType = 'role';
  } else {
    requestResourceType = Cypress.env('IS_FRAAS') ? 'alpha_role' : 'role';
  }
  return cy.request({
    method: 'PATCH',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${requestResourceType}/${roleId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: [{
      field: `/${resourceType === 'internal' ? 'authzMembers' : 'members'}/-`,
      operation: 'add',
      value: {
        _ref: `managed/${Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user'}/${userId}`,
        _refProperties: {},
      },
    }],
  });
}

/**
 * Assigns dashboard apps to a user in AM
 * @param {*} userId
 */
export function assignUserDashboard(userId, dashboards) {
  const userRealm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/${userRealm}/users/${userId}/services/dashboard`,
    body: {
      assignedDashboard: dashboards,
    },
    headers: {
      'content-type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
      'accept-api-version': 'protocol=1.0,resource=1.0',
    },
  });
}
