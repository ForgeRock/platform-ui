/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const CSR_BASE_URL = () => `https://${Cypress.env('FQDN')}/environment/csrs`;
const CSR_HEADERS = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'Accept-API-Version': 'protocol=1.0,resource=1.0',
});

/**
 * Creates a CSR entry via API
 * @param {string} commonName - The primary domain / common name (CN)
 * @param {Object} [overrides] - Optional field overrides
 * @param {string} [accessToken] - The access token to use for authentication
 * @returns {Promise} Cypress request promise
 */
export function createCsr(commonName, overrides = {}, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const body = {
    algorithm: 'rsa',
    commonName,
    organization: 'Organization',
    country: 'US',
    subjectAlternativeNames: [commonName],
    ...overrides,
  };

  return cy.request({
    method: 'POST',
    url: CSR_BASE_URL(),
    headers: CSR_HEADERS(accessToken),
    body,
  });
}

/**
 * Deletes a CSR entry via API
 * @param {string} csrId - The ID of the CSR to delete
 * @param {string} [accessToken] - The access token to use for authentication
 * @param {Object} [options] - Additional request options (e.g., { failOnStatusCode: false })
 * @returns {Promise} Cypress request promise
 */
export function deleteCsr(csrId, accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  return cy.request({
    method: 'DELETE',
    url: `${CSR_BASE_URL()}/${csrId}`,
    headers: CSR_HEADERS(accessToken),
    ...options,
  });
}

/**
 * Patches a CSR entry with a signed certificate via API
 * @param {string} csrId - The ID of the CSR to patch
 * @param {string} certificate - The PEM-encoded certificate chain content
 * @param {string} [accessToken] - The access token to use for authentication
 * @returns {Promise} Cypress request promise
 */
export function patchCsr(csrId, certificate, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PATCH',
    url: `${CSR_BASE_URL()}/${csrId}`,
    headers: CSR_HEADERS(accessToken),
    body: { certificate },
  });
}

/**
 * Gets all CSR entries via API
 * @param {string} [accessToken] - The access token to use for authentication
 * @returns {Promise} Cypress request promise
 */
export function getCsrs(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: CSR_BASE_URL(),
    headers: CSR_HEADERS(accessToken),
    failOnStatusCode: false,
  });
}
