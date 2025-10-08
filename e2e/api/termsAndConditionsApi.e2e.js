/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Gets the current terms and conditions configuration
 * @param {string} accessToken Access token to communicate with the API
 * @returns {Promise} A promise that will return the current terms and conditions
 */
export function getTermsAndConditions(accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/config/selfservice.terms`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    retryOnStatusCodeFailure: true,
  });
}

/**
 * Updates the terms and conditions configuration
 * @param {Object} termsConfig The terms and conditions configuration object
 * @param {string} accessToken Access token to communicate with the API
 * @returns {Promise} A promise that will update the terms and conditions
 */
export function updateTermsAndConditions(termsConfig, accessToken = Cypress.env('ACCESS_TOKEN')?.access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/selfservice.terms`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: termsConfig,
    retryOnStatusCodeFailure: true,
  });
}
