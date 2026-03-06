/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const COOKIE_BASE_URL = () => `https://${Cypress.env('FQDN')}/environment/sso-cookie`;
const COOKIE_DOMAINS_BASE_URL = () => `https://${Cypress.env('FQDN')}/environment/cookie-domains`;
const COOKIE_HEADERS = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
});

/**
 * Updates the cookie name via API
 * @param {string} name - The new cookie name
 * @param {string} [accessToken] - The access token to use for authentication
 * @param {Object} [options] - Additional request options (e.g., { failOnStatusCode: false })
 * @returns {Promise} Cypress request promise
 */
export function updateCookieName(name, accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  return cy.request({
    method: 'PUT',
    url: COOKIE_BASE_URL(),
    headers: COOKIE_HEADERS(accessToken),
    body: { name },
    ...options,
  });
}

/**
 * Resets the cookie name to its default value via API
 * @param {string} [accessToken] - The access token to use for authentication
 * @param {Object} [options] - Additional request options (e.g., { failOnStatusCode: false })
 * @returns {Promise} Cypress request promise
 */
export function resetCookieName(accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  return cy.request({
    method: 'POST',
    url: `${COOKIE_BASE_URL()}?_action=reset`,
    headers: COOKIE_HEADERS(accessToken),
    ...options,
  });
}

/**
 * Gets the current cookie domains via API
 * @param {string} [accessToken] - The access token to use for authentication
 * @param {Object} [options] - Additional request options (e.g., { failOnStatusCode: false })
 * @returns {Promise} Cypress request promise
 */
export function getCookieDomains(accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  return cy.request({
    method: 'GET',
    url: COOKIE_DOMAINS_BASE_URL(),
    headers: COOKIE_HEADERS(accessToken),
    ...options,
  });
}

/**
 * Updates the cookie domains via API
 * @param {string[]} domains - Array of domains to set
 * @param {string} [accessToken] - The access token to use for authentication
 * @param {Object} [options] - Additional request options (e.g., { failOnStatusCode: false })
 * @returns {Promise} Cypress request promise
 */
export function updateCookieDomains(domains, accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  return cy.request({
    method: 'PUT',
    url: COOKIE_DOMAINS_BASE_URL(),
    headers: COOKIE_HEADERS(accessToken),
    body: { domains },
    ...options,
  });
}
