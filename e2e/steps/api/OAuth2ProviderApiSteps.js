/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { deleteService, getService } from '@e2e/api/servicesApi.e2e';

const OAUTH2_PROVIDER_SERVICE_ID = 'oauth-oidc';

export default class OAuth2ProviderApiSteps {
  static createdScriptedJwtIssuerNames = [];

  static trackCreatedScriptedJwtIssuer(issuerName) {
    OAuth2ProviderApiSteps.createdScriptedJwtIssuerNames.push(issuerName);
  }

  static forgetCreatedScriptedJwtIssuer(issuerName) {
    OAuth2ProviderApiSteps.createdScriptedJwtIssuerNames = OAuth2ProviderApiSteps.createdScriptedJwtIssuerNames
      .filter((name) => name !== issuerName);
  }

  static getScriptedJwtIssuer(issuerName, options = {}) {
    return getService(OAUTH2_PROVIDER_SERVICE_ID, {
      subresource: `/scriptedJwtIssuers/${encodeURIComponent(issuerName)}`,
      ...options,
    });
  }

  static deleteCreatedScriptedJwtIssuers() {
    const issuerNames = [...OAuth2ProviderApiSteps.createdScriptedJwtIssuerNames];
    OAuth2ProviderApiSteps.createdScriptedJwtIssuerNames = [];

    return cy.wrap(issuerNames).each((issuerName) => deleteService(OAUTH2_PROVIDER_SERVICE_ID, {
      subresource: `/scriptedJwtIssuers/${encodeURIComponent(issuerName)}`,
      failOnStatusCode: false,
    }));
  }
}
