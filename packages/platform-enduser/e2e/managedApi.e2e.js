/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';

/**
 * Creates am identity? Works, but not sure if we should use this
 */
export function createAMTestUser() {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/authenticate`,
    headers: {
      'X-OpenAM-Username': Cypress.env('AM_USERNAME'),
      'X-OpenAM-Password': Cypress.env('AM_PASSWORD'),
      'content-type': 'application/json',
      'accept-api-version': 'resource=2.1',
    },
  }).then(() => cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/users/?_action=create`,
    body: {
      username: 'ForgerockDemo',
      userpassword: 'forgerock',
      mail: 'forgerockdemo@example.com',
    },
    headers: {
      'content-type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
      'accept-api-version': 'protocol=2.1,resource=3.0',
    },
  }));
}

/**
 * Use idm provisioning token to create super-user
 * Creates a user with
 * username: 'e2eTestUser<RandomNumber>',
 * password: 'Welcome1',
 * First Name: 'First'
 * Last Name: 'Last'
 */
export function createIDMTestUser() {
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/user?_action=create`,
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'content-type': 'application/json',
    },
    body: {
      userName: `e2eTestUser${random(Number.MAX_SAFE_INTEGER)}`,
      password: 'Welcome1',
      givenName: 'First',
      sn: 'Last',
      mail: 'forgerockdemo@example.com',
    },
  });
}

/**
 * Delete user, but does not currently work as idm provisioning is not allowed to perform delete
 * @param {*} userId
 */
export function deleteIDMTestUser(userId) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/user/${userId}`,
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'content-type': 'application/json',
      referer: `https://${Cypress.env('FQDN')}/platform/appAuthHelperRedirect.html`,
    },
  }).then(() => {});
}
