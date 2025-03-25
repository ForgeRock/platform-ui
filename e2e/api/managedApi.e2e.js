/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';

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
