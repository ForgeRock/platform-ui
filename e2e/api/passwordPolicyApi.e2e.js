/**
 * Copyright 2024-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export const USER_POLICY_RESOURCE = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';

/**
 * Gets the default saved Password Policy user config.
 */
export function getDefaultUserPolicy(accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/config/fieldPolicy/${USER_POLICY_RESOURCE}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
  });
}

/**
 * Saves Password Policy with provided user config.
 * @param {Object} config Contains form data to be saved
 * @param {String} [accessToken] admin access token
 * @param {Boolean} [waitForCompletion=false] resolve the PUT only after the
 * config change has propagated
 */
export function putUserPolicy(config, accessToken = Cypress.env('ACCESS_TOKEN').access_token, waitForCompletion = false) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/fieldPolicy/${USER_POLICY_RESOURCE}${waitForCompletion ? '?waitForCompletion=true' : ''}`,
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
    url: `https://${Cypress.env('FQDN')}/openidm/config/fieldPolicy/${USER_POLICY_RESOURCE}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    failOnStatusCode: false,
  });
}
