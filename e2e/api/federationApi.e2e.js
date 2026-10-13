/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const AM_SOCIAL_PROVIDERS_URL = `https://${Cypress.env('FQDN')}/am/json/realms/root/realm-config/services/SocialIdentityProviders`;

/**
 * Fetches the AM template for an OIDC social identity provider on the root realm.
 * Mirrors getSocialIdentityProvidersTemplate in
 * packages/platform-admin/src/api/SocialIdentityProvidersApi.js, but targets the
 * root realm directly (the app calls it without accessRoot, i.e. the current realm).
 *
 * @returns {Cypress.Chainable} the cy.request chainable resolving to the provider template
 */
export function getFederationProviderTemplate() {
  return cy.request({
    method: 'POST',
    url: `${AM_SOCIAL_PROVIDERS_URL}/oidcConfig?_action=template`,
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN')?.access_token}`,
      'Accept-API-Version': 'protocol=1.0,resource=1.0',
      'Content-Type': 'application/json',
    },
    body: {},
  });
}

/**
 * Creates an admin federation (social) identity provider on the root realm.
 * Mirrors createSocialIdentityProvider in
 * packages/platform-admin/src/api/SocialIdentityProvidersApi.js with accessRoot=true.
 *
 * @param {Object} providerConfig the provider config to create (template + form values)
 * @returns {Cypress.Chainable} the cy.request chainable
 */
export function createFederationProvider(providerConfig) {
  return cy.request({
    method: 'POST',
    url: `${AM_SOCIAL_PROVIDERS_URL}/oidcConfig?_action=create`,
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN')?.access_token}`,
      'Accept-API-Version': 'protocol=1.0,resource=1.0',
      'Content-Type': 'application/json',
    },
    body: providerConfig,
  });
}

/**
 * Deletes an admin federation (social) identity provider from the root realm.
 * Mirrors deleteSocialIdentityProviderById in
 * packages/platform-admin/src/api/SocialIdentityProvidersApi.js with accessRoot=true.
 *
 * @param {String} providerId the id (name) of the identity provider to delete
 * @param {String} providerRoute provider config route, defaults to 'oidcConfig'
 * @param {String} accessToken admin access token
 * @param {Object} options extra cy.request options (e.g. { failOnStatusCode: false })
 * @returns {Cypress.Chainable} the cy.request chainable
 */
export function deleteFederationProvider(providerId, providerRoute = 'oidcConfig', accessToken = Cypress.env('ACCESS_TOKEN')?.access_token, options = {}) {
  return cy.request({
    method: 'DELETE',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/realm-config/services/SocialIdentityProviders/${providerRoute}/${providerId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'Accept-API-Version': 'protocol=1.0,resource=1.0',
    },
    ...options,
  });
}
