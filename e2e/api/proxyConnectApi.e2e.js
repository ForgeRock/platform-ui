/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const PROXY_CONNECT_URL = `https://${Cypress.env('FQDN')}/environment/proxy-connect`;

/**
 * Resolves the access token lazily (inside the command queue) so helpers can
 * be called in beforeEach hooks queued after loginCached() — the token is
 * only in Cypress.env once the login commands have actually run.
 */
function token(accessToken) {
  return accessToken ?? Cypress.env('ACCESS_TOKEN').access_token;
}

/**
 * Gets the current global Proxy Connect configuration
 * @param {String} accessToken optional explicit bearer token
 * @param {Object} options `{ failOnStatusCode }` — pass false to let callers
 *   handle non-2xx polling responses themselves (retries also go off: Cypress
 *   rejects the failOnStatusCode-false + retry combination)
 */
export function getProxyConnectConfig(accessToken, { failOnStatusCode = true } = {}) {
  return cy.then(() => cy.request({
    method: 'GET',
    url: PROXY_CONNECT_URL,
    headers: {
      authorization: `Bearer ${token(accessToken)}`,
      'accept-api-version': 'protocol=1.0,resource=1.0',
    },
    retryOnStatusCodeFailure: failOnStatusCode,
    failOnStatusCode,
  }));
}

/**
 * Sets the full Proxy Connect configuration body
 * @param {Object} body full config, e.g. { proxyStatus, headerRules: {enabled, headers}, ipRules: {enabled, ipRanges} }
 */
export function putProxyConnectConfig(body, accessToken) {
  return cy.then(() => cy.request({
    method: 'PUT',
    url: PROXY_CONNECT_URL,
    headers: {
      authorization: `Bearer ${token(accessToken)}`,
      'content-type': 'application/json',
      'accept-api-version': 'protocol=1.0,resource=1.0',
    },
    body,
    retryOnStatusCodeFailure: true,
  }));
}

/**
 * Seeds IP ranges, preserving the rest of the current config
 * @param {Array} ipRanges array of IP strings, e.g. ['192.0.2.10/32']
 */
export function seedIpRanges(ipRanges, accessToken) {
  return getProxyConnectConfig(accessToken).then(({ body }) => putProxyConnectConfig({
    proxyStatus: body.proxyStatus,
    headerRules: body.headerRules,
    ipRules: {
      enabled: body.ipRules.enabled,
      ipRanges,
    },
  }, accessToken));
}
