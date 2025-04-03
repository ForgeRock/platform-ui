/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const loginRealm = Cypress.env('IS_FRAAS') ? 'realms/alpha/' : '';

export function getValidTogoDestinations() {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/${loginRealm}realm-config/services/validation`,
    headers: {
      Authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'Content-Type': 'application/json',
    },
  });
}

export function putValidTogoDestinations(validTogoDestinationsBody) {
  delete validTogoDestinationsBody._rev;
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/${loginRealm}realm-config/services/validation`,
    headers: {
      Authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'Content-Type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    body: validTogoDestinationsBody,
  });
}
