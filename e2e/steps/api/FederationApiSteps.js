/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  createFederationProvider,
  getFederationProviderTemplate,
} from '@e2e/api/federationApi.e2e';

// Global Identity Provider transform GUID (adminFederationConstants in the app source)
const PROVIDER_TRANSFORM_GUID = 'dc0c9905-4a58-4f61-8562-337514e610a7';

export default class FederationApiSteps {
  /**
   * Creates an Azure OIDC provider via the AM REST API, mirroring the payload
   * the new-provider modal builds: the AM provider template merged with the
   * stage-3 form values and the default `&{fqdn}` redirect URI placeholder.
   * @param {String} providerName name (_id) of the provider to create
   * @param {String} wellKnownEndpoint the provider's well-known endpoint URL
   * (required in the edit view's validation, so it must be seeded non-empty)
   * @param {Object} wellKnownConfig OpenID configuration for the endpoint fields
   * @param {Object} credentials Azure application credentials
   * @param {String} credentials.applicationId Azure application (client) ID
   * @param {String} credentials.applicationSecret Azure application (client) secret
   * @returns {Cypress.Chainable} the create request
   */
  static createAzureProviderViaApi(providerName, wellKnownEndpoint, wellKnownConfig, { applicationId, applicationSecret }) {
    return getFederationProviderTemplate().then(({ body: template }) => createFederationProvider({
      ...template,
      _id: providerName,
      authenticationIdKey: 'id',
      authorizationEndpoint: wellKnownConfig.authorization_endpoint,
      clientId: applicationId,
      clientSecret: applicationSecret,
      issuer: wellKnownConfig.issuer,
      redirectURI: 'https://&{fqdn}/login/admin',
      // The new-provider modal persists the button display name in the AM record
      // (SettingsPanel.saveObject.uiConfig); without it the edit view's required
      // Button Text field is empty and the Save button stays disabled
      uiConfig: { buttonDisplayName: 'Azure' },
      scopeDelimiter: ' ',
      scopes: ['User.Read', 'openid', 'profile'],
      tokenEndpoint: wellKnownConfig.token_endpoint,
      transform: PROVIDER_TRANSFORM_GUID,
      userInfoEndpoint: wellKnownConfig.userinfo_endpoint,
      wellKnownEndpoint,
    }));
  }
}
