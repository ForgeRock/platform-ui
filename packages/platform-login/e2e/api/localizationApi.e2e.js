/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Delete a config translation file
 */
export function deleteOverrides(accessToken = Cypress.env('ACCESS_TOKEN').access_token, locale) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/config/uilocale/${locale}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Add a config translation file
 */
export default function (accessToken = Cypress.env('ACCESS_TOKEN').access_token, locale, body) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/uilocale/${locale}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body,
  });
}
