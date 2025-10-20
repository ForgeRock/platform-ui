/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Deletes an endpoint via API
 * @param {string} endpointName - The name of the endpoint to delete
 * @param {string} accessToken - The access token for authentication
 */
// eslint-disable-next-line import/prefer-default-export
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
