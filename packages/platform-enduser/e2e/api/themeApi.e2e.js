/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
* Gets the list of themes that currently exist in the environment
*/
// eslint-disable-next-line import/prefer-default-export
export function getThemesList(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/config/ui/themerealm`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json;charset=utf-8',
    },
  });
}
