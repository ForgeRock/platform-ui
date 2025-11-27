/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Creates a log API key via the API
 * @param {string} name - The name of the API key
 * @param {string} accessToken - The access token to use for authentication
 * @returns {Promise} Cypress request promise
 */
export function createLogApiKey(name, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const body = {
    name,
  };

  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/keys?_action=create`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body,
  });
}

/**
 * Deletes a log API key via the API
 * @param {string} keyId - The ID of the API key to delete
 * @param {string} accessToken - The access token to use for authentication
 * @returns {Promise} Cypress request promise
 */
export function deleteLogApiKey(keyId, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/keys/${keyId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
