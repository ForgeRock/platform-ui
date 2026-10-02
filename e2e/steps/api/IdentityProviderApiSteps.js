/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  createService,
  deleteService,
  getService,
  getServiceTemplate,
} from '@e2e/api/servicesApi.e2e';

const SERVICE_ID = 'SocialIdentityProviders';
const PROVIDER_TYPE = 'oidcConfig';

/**
 * Resolves the id of a named transform script in the current realm. The transform ids are
 * per-tenant, so they must be looked up, not hardcoded.
 * @param {string} scriptName - script display name, e.g. 'Google Profile Normalization'
 */
function getTransformScriptId(scriptName) {
  const realm = Cypress.env('IS_FRAAS') ? 'realms/alpha/' : '';
  return cy.request({
    method: 'GET',
    url: `https://${Cypress.env('FQDN')}/am/json/realms/root/${realm}scripts?_queryFilter=name+eq+"${encodeURIComponent(scriptName)}"`,
    headers: {
      Authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
      'Content-Type': 'application/json',
      'Accept-API-Version': 'protocol=2.1,resource=1.0',
    },
  }).then(({ body }) => {
    if (!body.result?.length) {
      throw new Error(`Transform script "${scriptName}" not found in the current realm`);
    }
    return body.result[0]._id;
  });
}

/**
 * Builds the create payload from AM's own template plus the fields the edit UI requires
 * on save. The template alone is rejected by create (empty scopeDelimiter) and leaves the
 * schema-required transform unset, which the edit form needs for a clean round-trip.
 * @param {Object} template - provider template from getServiceTemplate
 * @param {string} transformScriptId - transform script id from getTransformScriptId
 * @param {string} providerId - unique id for the provider
 * @returns {Object} payload for the create action
 */
function buildValidOidcProvider(template, transformScriptId, providerId) {
  return {
    ...template,
    _id: providerId,
    clientId: 'e2e-client',
    clientSecret: 'e2e-client-secret',
    issuer: 'https://accounts.google.com',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
    authenticationIdKey: 'sub',
    redirectURI: `https://${Cypress.env('FQDN')}/am/oauth2/${Cypress.env('IS_FRAAS') ? 'realms/alpha' : 'realms/root'}/callback`,
    scopeDelimiter: ' ',
    scopes: ['openid', 'email', 'profile'],
    transform: transformScriptId,
    enabled: true,
  };
}

export default class IdentityProviderApiSteps {
  static createdProviderIds = [];

  /**
   * Seeds a valid, saveable OIDC provider via API and tracks its id for cleanup. The
   * payload starts from AM's own create template and resolves the transform script by
   * name, so tenant-owned values (defaults, script ids) are never hardcoded here.
   * @returns {Cypress.Chainable} create response (body._id is the provider id)
   */
  static createProvider() {
    const providerId = `Automated-E2E-${Date.now()}`;
    return getTransformScriptId('Google Profile Normalization')
      .then((transformScriptId) => getServiceTemplate(SERVICE_ID, { subresource: `/${PROVIDER_TYPE}` }).then(({ body: template }) => createService(
        SERVICE_ID,
        buildValidOidcProvider(template, transformScriptId, providerId),
        { subresource: `/${PROVIDER_TYPE}` },
      )).then((response) => {
        IdentityProviderApiSteps.createdProviderIds.push(response.body._id);
        return response;
      }));
  }

  /**
   * Gets a single provider, pass options { failOnStatusCode: false } to assert 404.
   * @param {string} providerId - provider id
   * @param {Object} options - extra cy.request options
   */
  static getProvider(providerId, options = {}) {
    return getService(SERVICE_ID, {
      subresource: `/${PROVIDER_TYPE}/${encodeURIComponent(providerId)}`,
      ...options,
    });
  }

  /**
   * Deletes every provider created by createProvider in this test. A provider the test
   * already deleted through the UI yields 404 on this second DELETE, which is tolerated.
   * The tracker is cleared only after all deletes resolve, so a mid-loop failure keeps
   * the remaining ids for the next afterEach.
   */
  static deleteCreatedProviders() {
    return cy.wrap(IdentityProviderApiSteps.createdProviderIds).then((ids) => {
      if (!ids.length) return cy.wrap(null);
      return cy.wrap(ids).each((id) => deleteService(SERVICE_ID, {
        subresource: `/${PROVIDER_TYPE}/${encodeURIComponent(id)}`,
        failOnStatusCode: false,
      }).then((response) => {
        if (!response.isOkStatusCode && response.status !== 404) {
          throw new Error(`Failed to delete identity provider ${id} — tenant may be in a dirty state. Status: ${response.status}`);
        }
      })).then(() => {
        IdentityProviderApiSteps.createdProviderIds = [];
      });
    });
  }
}
