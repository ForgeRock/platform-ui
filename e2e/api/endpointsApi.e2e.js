/**
 * Copyright 2025-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Creates an endpoint via API
 * @param {string} endpointName - The name of the endpoint to create
 * @param {string} accessToken - The access token for authentication
 * @param {string} source - Optional JavaScript source for the endpoint
 */
export function createEndpoint(
  endpointName,
  accessToken = Cypress.env('ACCESS_TOKEN').access_token,
  source = '(function () { return {}; }());',
) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/endpoint/${endpointName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: {
      type: 'text/javascript',
      source,
    },
  });
}

/**
 * Creates an endpoint whose `read` branch returns the sample payload used by the Test panel cases
 * @param {string} endpointName - The name of the endpoint to create
 * @param {string} accessToken - The access token for authentication
 */
export function createReadSampleEndpoint(endpointName, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/openidm/config/endpoint/${endpointName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: {
      type: 'text/javascript',
      source: [
        '(function () {',
        "  if (request.method === 'read') {",
        '    return {',
        '      data: { name: \'Sample Item\', description: \'This is just a sample return value\', id: 1 },',
        "      message: 'Read successful',",
        "      status: 'ok'",
        '    };',
        '  }',
        '  return {};',
        '}());',
      ].join('\n'),
    },
  });
}

/**
 * Deletes an endpoint via API
 * @param {string} endpointName - The name of the endpoint to delete
 * @param {string} accessToken - The access token for authentication
 */
export function deleteEndpoint(endpointName, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/config/endpoint/${endpointName}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    failOnStatusCode: false,
  });
}
