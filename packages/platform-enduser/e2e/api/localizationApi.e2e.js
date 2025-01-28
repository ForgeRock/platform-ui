/**
 * Copyright (c) 2021-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Add a config translation file
 */
export function addOverrides(locale, body) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/uilocale/${locale}`,
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'content-type': 'application/json',
    },
    body,
  });
}

/**
 * Delete a config translation file
 */
export function deleteOverrides(locale, failOnStatusCodeToggle = true) {
  return cy.request({
    failOnStatusCode: failOnStatusCodeToggle,
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/config/uilocale/${locale}`,
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
    },
  });
}
