/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import createApplication, { createOAuth2Client, deleteApplication, deleteOAuth2Client } from '@e2e/api/applicationsApi.e2e';

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
    const userResource = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    return createOAuth2Client(clientId, appName).then(() => {
      ApplicationApiSteps.createdClientIds.push(clientId);
      return createApplication({
        name: appName,
        owners: [{ _ref: `managed/${userResource}/${ownerId}`, _refProperties: {} }],
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

  static deleteCreatedApplications() {
    return cy.wrap(null).then(() => {
      const managedIds = [...ApplicationApiSteps.createdManagedAppIds];
      const clientIds = [...ApplicationApiSteps.createdClientIds];
      const applicationIds = [...ApplicationApiSteps.createdApplicationIds];
      ApplicationApiSteps.createdManagedAppIds = [];
      ApplicationApiSteps.createdClientIds = [];
      ApplicationApiSteps.createdApplicationIds = [];

      const deleteManaged = managedIds.length
        ? cy.wrap(managedIds).each((id) => deleteApplication(id).then((response) => {
          if (!response.isOkStatusCode) {
            throw new Error(`Failed to delete managed application ${id} — tenant may be in a dirty state. Status: ${response.status}`);
          }
        }))
        : cy.wrap(null);

      return deleteManaged
        .then(() => {
          if (!clientIds.length) return cy.wrap(null);
          return cy.wrap(clientIds).each((id) => deleteOAuth2Client(id).then((response) => {
            if (!response.isOkStatusCode) {
              throw new Error(`Failed to delete OAuth2 client ${id} — tenant may be in a dirty state. Status: ${response.status}`);
            }
          }));
        })
        .then(() => {
          if (!applicationIds.length) return cy.wrap(null);
          return cy.wrap(applicationIds).each((id) => deleteApplication(id));
        });
    });
  }
}
