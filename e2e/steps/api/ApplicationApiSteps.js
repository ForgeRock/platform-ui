/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import createApplication, {
  createOAuth2Client,
  deleteApplication,
  deleteOAuth2Client,
  getApplication,
} from '@e2e/api/applicationsApi.e2e';
import { deleteSaml2Entity } from '@e2e/api/saml2Api.e2e';

export default class ApplicationApiSteps {
  static createdManagedAppIds = [];

  static createdClientIds = [];

  static createdApplicationIds = [];

  static get applicationResourceName() {
    return Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
  }

  static trackNextCreation(clientId) {
    const managedResource = Cypress.env('IS_FRAAS') ? 'alpha_application' : 'application';
    cy.intercept('POST', `/openidm/managed/${managedResource}?_action=create`, (req) => {
      req.continue((res) => {
        if (res.statusCode === 201 && res.body?._id) {
          ApplicationApiSteps.createdManagedAppIds.push(res.body._id);
        }
      });
    }).as('createManagedApplication');
    cy.intercept('PUT', `**/agents/OAuth2Client/${clientId}`, (req) => {
      req.continue((res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          ApplicationApiSteps.createdClientIds.push(clientId);
        }
      });
    }).as('createOAuth2Client');
  }

  /** Create a minimal native/spa application via API and track its id for cleanup. */
  static createApplication(appName) {
    return createApplication({
      name: appName,
      templateName: 'web',
      templateVersion: '2.0',
      authoritative: false,
    }).then((response) => {
      expect(response.status).to.equal(201);
      ApplicationApiSteps.createdApplicationIds.push(response.body._id);
      return response;
    });
  }

  /**
   * Create a native/SPA custom application the same way the UI does: an AM OAuth2
   * client linked to an IDM managed application via ssoEntities.oidcId. Both the
   * managed application id and the client id are tracked for cleanup.
   * @param {Object} options
   * @param {string} options.appName - Name of the managed application (also used as clientName)
   * @param {string} options.clientId - Client id for the AM OAuth2 client
   * @param {string} options.ownerId - Managed user id set as the application owner
   * @returns {Cypress.Chainable} The response from the create application request
   */
  static createNativeSpaApplication({ appName, clientId, ownerId }) {
    return ApplicationApiSteps.createNativeSpaApplicationWithOwners({ appName, clientId, ownerIds: [ownerId] });
  }

  /**
   * Create a native/SPA custom application with one or more owners. The owners
   * array shape mirrors what the UI wizard saves (one owners edge per user).
   * @param {Object} options
   * @param {string} options.appName - Name of the managed application (also used as clientName)
   * @param {string} options.clientId - Client id for the AM OAuth2 client
   * @param {string[]} options.ownerIds - Managed user ids set as the application owners
   * @returns {Cypress.Chainable} The response from the create application request
   */
  static createNativeSpaApplicationWithOwners({ appName, clientId, ownerIds }) {
    const userResource = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    return createOAuth2Client(clientId, appName).then(() => {
      ApplicationApiSteps.createdClientIds.push(clientId);
      return createApplication({
        name: appName,
        owners: ownerIds.map((ownerId) => ({ _ref: `managed/${userResource}/${ownerId}`, _refProperties: {} })),
        templateName: 'native',
        templateVersion: '1.0',
        ssoEntities: { oidcId: clientId },
      }).then((response) => {
        expect(response.status).to.equal(201);
        ApplicationApiSteps.createdApplicationIds.push(response.body._id);
        return response;
      });
    });
  }

  /**
   * Delete every tracked application and OAuth2 client. Managed applications
   * are deleted first, tolerating already-deleted apps and removing any AM
   * SAML entity providers their ssoEntities reference (hosted IdP, then remote
   * SP), then the OAuth2 clients. A failure to delete leaves the tenant dirty
   * and fails the test.
   */
  static deleteCreatedApplications() {
    const managedIds = [
      ...ApplicationApiSteps.createdManagedAppIds,
      ...ApplicationApiSteps.createdApplicationIds,
    ];
    const clientIds = [...ApplicationApiSteps.createdClientIds];
    ApplicationApiSteps.createdManagedAppIds = [];
    ApplicationApiSteps.createdClientIds = [];
    ApplicationApiSteps.createdApplicationIds = [];

    const deleteManagedApps = managedIds.length
      ? cy.wrap(managedIds).each((id) => ApplicationApiSteps.deleteManagedApplication(id))
      : cy.wrap(null);

    return deleteManagedApps.then(() => {
      if (!clientIds.length) return cy.wrap(null);
      return cy.wrap(clientIds).each((id) => deleteOAuth2Client(id).then((response) => {
        if (!response.isOkStatusCode) {
          throw new Error(`Failed to delete OAuth2 client ${id} — tenant may be in a dirty state. Status: ${response.status}`);
        }
      }));
    });
  }

  /**
   * Delete one managed application: AM SAML entity providers from its
   * ssoEntities first, then the application itself. Both steps tolerate the
   * resource already being gone (e.g. deleted through the UI under test).
   * @param {string} id - Managed application id to delete
   * @returns {Cypress.Chainable}
   */
  static deleteManagedApplication(id) {
    return getApplication(id).then((getResponse) => {
      if (!getResponse.isOkStatusCode) return null;

      const ssoEntities = getResponse.body.ssoEntities || {};
      return cy.wrap(null)
        .then(() => {
          if (ssoEntities.idpPrivateId) {
            return deleteSaml2Entity(ssoEntities.idpPrivateId, 'hosted');
          }
          return null;
        })
        .then(() => {
          if (ssoEntities.spPrivateId) {
            return deleteSaml2Entity(ssoEntities.spPrivateId, 'remote');
          }
          return null;
        })
        .then(() => deleteApplication(id).then((deleteResponse) => {
          // 404 means the app was already deleted (e.g. through the UI)
          if (!deleteResponse.isOkStatusCode && deleteResponse.status !== 404) {
            throw new Error(`Failed to delete managed application ${id} — tenant may be in a dirty state. Status: ${deleteResponse.status}`);
          }
        }));
    });
  }
}
