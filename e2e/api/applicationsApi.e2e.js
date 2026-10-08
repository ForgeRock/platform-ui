/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Creates a new application via API
 * @param {Object} applicationData - The application data to be created
 * @param {string} accessToken - Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response from the create application request
 */

export default function createApplication(applicationData, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const applicationResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  return cy.request({
    method: 'POST',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${applicationResource}?_action=create`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: applicationData,
  });
}

/**
 * Deletes an application via API
 * @param {string} applicationId - The application ID to delete
 * @param {string} accessToken - Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response from the delete application request
 */
export function deleteApplication(applicationId, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const applicationResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${applicationResource}/${applicationId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    failOnStatusCode: false,
  });
}

/**
 * Gets an application via API
 * @param {string} applicationId - The application ID to get
 * @param {string} accessToken - Optional access token, defaults to environment ACCESS_TOKEN
 * @returns {Cypress.Chainable} The response from the get application request
 */
export function getApplication(applicationId, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const applicationResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${applicationResource}/${applicationId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    failOnStatusCode: false,
  });
}

/**
 * Creates an OAuth2 client in AM
 * @param {string} clientId - The OAuth2 client ID
 * @param {string} clientName - The display name for the client
 * @returns {Cypress.Chainable} The response from the create OAuth2 client request
 */
export function createOAuth2Client(clientId, clientName) {
  const realm = Cypress.env('IS_FRAAS') ? '/realms/alpha' : '';
  return cy.request({
    method: 'PUT',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root${realm}/realm-config/agents/OAuth2Client/${clientId}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    body: {
      coreOAuth2ClientConfig: {
        redirectionUris: [],
        scopes: ['openid'],
        defaultScopes: [],
        clientType: 'Public',
        authorizationCodeLifetime: 120,
        accessTokenLifetime: 3600,
        refreshTokenLifetime: 604800,
        clientName: [clientName],
      },
      advancedOAuth2ClientConfig: {
        grantTypes: ['authorization_code', 'refresh_token'],
        responseTypes: ['code', 'token', 'id_token'],
        treeName: '[Empty]',
        tokenEndpointAuthMethod: 'client_secret_basic',
        isConsentImplied: true,
        subjectType: 'public',
      },
      coreOpenIDClientConfig: {
        defaultMaxAge: 600,
        jwtTokenLifetime: 3600,
      },
      signEncOAuth2ClientConfig: {
        userinfoResponseFormat: 'JSON',
        tokenIntrospectionResponseFormat: 'JSON',
        publicKeyLocation: 'jwks_uri',
      },
    },
  });
}

/**
 * Patches an application via API with an if-match revision guard
 * @param {string} applicationId - The application ID to patch
 * @param {Array} body - The JSON patch operations
 * @param {string} ifMatchRev - The _rev the patch applies to
 * @param {Object} [options]
 * @param {boolean} [options.failOnStatusCode] - Whether non-2xx responses fail the test (default true)
 * @returns {Cypress.Chainable} The response from the patch application request
 */
export function patchApplication(applicationId, body, ifMatchRev, { failOnStatusCode = true } = {}) {
  const applicationResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  return cy.request({
    method: 'PATCH',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${applicationResource}/${applicationId}`,
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'content-type': 'application/json',
      'if-match': ifMatchRev,
    },
    body,
    failOnStatusCode,
  });
}

/**
 * Lists an application's owners — the owners relationship sub-resource the UI
 * also reads (the plain application GET does not return relationship fields).
 * @param {string} applicationId - The application ID
 * @returns {Cypress.Chainable} The response from the owners list request
 */
export function getApplicationOwners(applicationId) {
  const applicationResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/openidm/managed/${applicationResource}/${applicationId}/owners?_queryFilter=true`,
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'content-type': 'application/json',
    },
  });
}

/**
 * Gets an OAuth2 client from AM
 * @param {string} clientId - The OAuth2 client ID
 * @returns {Cypress.Chainable} The response from the get OAuth2 client request
 */
export function getOAuth2Client(clientId) {
  const realm = Cypress.env('IS_FRAAS') ? '/realms/alpha' : '';
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root${realm}/realm-config/agents/OAuth2Client/${clientId}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    failOnStatusCode: false,
  });
}

/**
 * Deletes an OAuth2 client in AM
 * @param {string} clientId - The OAuth2 client ID to delete
 * @returns {Cypress.Chainable} The response from the delete OAuth2 client request
 */
export function deleteOAuth2Client(clientId) {
  const realm = Cypress.env('IS_FRAAS') ? '/realms/alpha' : '';
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root${realm}/realm-config/agents/OAuth2Client/${clientId}`,
    headers: {
      'content-type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
    failOnStatusCode: false,
  });
}
