/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { deleteApplication, deleteOAuth2Client } from '@e2e/api/applicationsApi.e2e';

export default class ApplicationApiSteps {
  static createdManagedAppIds = [];

  static createdClientIds = [];

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

  static deleteCreatedApplications() {
    return cy.wrap(null).then(() => {
      const managedIds = [...ApplicationApiSteps.createdManagedAppIds];
      const clientIds = [...ApplicationApiSteps.createdClientIds];
      ApplicationApiSteps.createdManagedAppIds = [];
      ApplicationApiSteps.createdClientIds = [];

      const deleteManaged = managedIds.length
        ? cy.wrap(managedIds).each((id) => deleteApplication(id).then((response) => {
          if (!response.isOkStatusCode) {
            throw new Error(`Failed to delete managed application ${id} — tenant may be in a dirty state. Status: ${response.status}`);
          }
        }))
        : cy.wrap(null);
      return deleteManaged.then(() => {
        if (!clientIds.length) return cy.wrap(null);
        return cy.wrap(clientIds).each((id) => deleteOAuth2Client(id).then((response) => {
          if (!response.isOkStatusCode) {
            throw new Error(`Failed to delete OAuth2 client ${id} — tenant may be in a dirty state. Status: ${response.status}`);
          }
        }));
      });
    });
  }
}
