/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const userRequestObject = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';

/**
 * Gets the default saved Password Policy user config.
 */
export function getDefaultUserPolicy(accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/config/fieldPolicy/${userRequestObject}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
  });
}

/**
 * Saves Password Policy with provided user config.
 * @param {Object} config Contains form data to be saved
 */
export function putUserPolicy(config, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/fieldPolicy/${userRequestObject}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: config,
    retryOnStatusCodeFailure: true,
  });
}

/**
 * Deletes saved Password Policy user config.
 */
export function deleteUserPolicy(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/config/fieldPolicy/${userRequestObject}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    failOnStatusCode: false,
  });
}
