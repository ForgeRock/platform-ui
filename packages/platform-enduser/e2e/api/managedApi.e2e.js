/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';

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

export function createIDMResource(resourceType = 'managed', resourceName, body, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}?_action=create`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body,
  });
}

/**
 * Use idm provisioning token to create super-user
 * Creates a user with
 * username: 'e2eTestUser<RandomNumber>',
 * password: 'Rg_GRg9k&e',
 * First Name: 'First'
 * Last Name: 'Last'
 */
export function createIDMUser(userBody) {
  const body = {
    userName: `e2eTestUser${random(Number.MAX_SAFE_INTEGER)}`,
    password: 'Rg_GRg9k&e',
    givenName: 'First',
    sn: 'Last',
    mail: 'forgerockdemo@example.com',
    ...userBody,
  };
  return createIDMResource('managed', Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user', body);
}

export function deleteIDMResource(resourceType = 'managed', resourceName, id, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/${resourceType}/${resourceName}/${id}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}

export function deleteIDMUser(id) {
  return deleteIDMResource('managed', Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user', id);
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
