/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Creates a service account via IDM API
 * @param {Object} serviceAccountData - The service account data
 * @param {string} serviceAccountData.name - The name of the service account
 * @param {string} serviceAccountData.description - The description of the service account
 * @param {Array<string>} serviceAccountData.scopes - The scopes/permissions for the service account
 * @param {string} serviceAccountData.jwks - The JSON Web Key Set
 * @param {string} accessToken - The access token to use for authentication
 * @returns {Promise} Cypress request promise
 */
export function createServiceAccount(serviceAccountData, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.fixture('serviceAccountJwksKey.json').then((defaultJwks) => {
    const body = {
      name: serviceAccountData.name,
      description: serviceAccountData.description || null,
      scopes: serviceAccountData.scopes || ['fr:am:*'],
      jwks: serviceAccountData.jwks || JSON.stringify(defaultJwks),
    };

    return cy.request({
      method: 'POST',
      url: `https://${Cypress.env('FQDN')}/openidm/managed/svcacct?_action=create`,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body,
    });
  });
}

/**
 * Deletes a service account via IDM API
 * @param {string} serviceAccountId - The ID of the service account to delete
 * @param {string} accessToken - The access token to use for authentication
 * @param {Object} options - Additional request options (e.g., { failOnStatusCode: false })
 * @returns {Promise} Cypress request promise
 */
export function deleteServiceAccount(serviceAccountId, accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/svcacct/${serviceAccountId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    ...options,
  });
}

/**
 * Gets all service accounts via IDM API
 * @param {string} accessToken - The access token to use for authentication
 * @returns {Promise} Cypress request promise
 */
export function getServiceAccounts(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/svcacct?_queryFilter=true`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
  });
}
