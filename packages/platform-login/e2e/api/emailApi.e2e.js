/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Attempts to save email provider with provided config
 * @param {Object} config Contains form data to be saved
 */
export function putEmailProviderConfig(config, accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/external.email`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: config,
    retryOnStatusCodeFailure: true,
  });
}

/**
 * Gets the default email provider config from the tenant
 * @param {Object} the default provider details
 */
export function getDefaultProviderConfig(accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  const emailEndpoint = Cypress.env('IS_FRAAS') ? 'external.emailDefault' : 'external.email';
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/config/${emailEndpoint}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    retryOnStatusCodeFailure: true,
  });
}
