/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const CORS_BASE_URL = () => `https://${Cypress.env('FQDN')}/am/json/global-config/services/CorsService/configuration`;
const CORS_HEADERS = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'Accept-API-Version': 'protocol=2.1,resource=1.0',
});

/**
 * Creates a CORS configuration via AM API
 * @param {string} name - The unique ID / name of the CORS configuration
 * @param {Object} [overrides] - Optional field overrides
 * @param {string} [accessToken] - The access token to use for authentication
 * @returns {Promise} Cypress request promise
 */
export function createCorsConfiguration(name, overrides = {}, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const body = {
    acceptedOrigins: ['https://localhost:8443', 'https://localhost:8443/'],
    acceptedMethods: ['POST', 'GET'],
    acceptedHeaders: ['accept-api-version', 'x-requested-with', 'content-type', 'authorization'],
    allowCredentials: true,
    maxAge: 600,
    _id: name,
    enabled: true,
    ...overrides,
  };

  return cy.request({
    method: 'POST',
    url: `${CORS_BASE_URL()}?_action=create`,
    headers: CORS_HEADERS(accessToken),
    body,
  });
}

/**
 * Deletes a CORS configuration via AM API
 * @param {string} corsId - The ID of the CORS configuration to delete
 * @param {string} [accessToken] - The access token to use for authentication
 * @param {Object} [options] - Additional request options (e.g., { failOnStatusCode: false })
 * @returns {Promise} Cypress request promise
 */
export function deleteCorsConfiguration(corsId, accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  return cy.request({
    method: 'DELETE',
    url: `${CORS_BASE_URL()}/${corsId}`,
    headers: CORS_HEADERS(accessToken),
    ...options,
  });
}

/**
 * Gets all CORS configurations via AM API
 * @param {string} [accessToken] - The access token to use for authentication
 * @returns {Promise} Cypress request promise
 */
export function getCorsConfigurations(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: `${CORS_BASE_URL()}?_queryFilter=true`,
    headers: CORS_HEADERS(accessToken),
    failOnStatusCode: false,
  });
}
