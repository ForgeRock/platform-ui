/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

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
