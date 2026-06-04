/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { createJourney, deleteAMResource } from '@e2e/api/journeyApi.e2e';
import { journeyCleanupManager } from '@e2e/utils/manageJourneys';
import { generateJourneyFileName } from '@e2e/utils/journeyUtils';

export default class JourneyApiSteps {
  static createdJourneyNames = [];

  static importJourney(journey) {
    const alreadyImported = journeyCleanupManager.getAll().find((j) => j.name === journey.name);
    if (!alreadyImported) {
      const fileName = generateJourneyFileName(journey.name);
      cy.importTreesViaAPI([fileName]).then(() => {
        journeyCleanupManager.add({ name: journey.name, fileName });
      });
    }
  }

  static deleteImportedJourneys() {
    journeyCleanupManager.cleanup();
  }

  static interceptCreatedJourney() {
    cy.intercept('PUT', '**/authenticationtrees/trees/*', (req) => {
      req.continue((res) => {
        if (res.statusCode === 201) {
          JourneyApiSteps.createdJourneyNames.push(res.body._id);
        }
      });
    }).as('putJourney');
  }

  static interceptDuplicatedJourney() {
    cy.intercept('PUT', '**/authenticationtrees/trees/*', (req) => {
      req.continue((res) => {
        if (res.statusCode === 200) {
          JourneyApiSteps.createdJourneyNames.push(res.body._id);
        }
      });
    }).as('putJourney');
  }

  static createJourney(name, categories = []) {
    const identityResource = Cypress.env('IS_FRAAS') ? 'managed/alpha_user' : 'managed/user';
    return createJourney(name, identityResource, categories).then((response) => {
      JourneyApiSteps.createdJourneyNames.push(name);
      return response;
    });
  }

  static deleteCreatedJourneys() {
    const realm = Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha/' : '/realms/root/';
    const resource = 'realm-config/authentication/authenticationtrees/trees';
    return cy.wrap(null).then(() => {
      if (!JourneyApiSteps.createdJourneyNames.length) return cy.wrap(null);
      const names = [...JourneyApiSteps.createdJourneyNames];
      JourneyApiSteps.createdJourneyNames = [];
      return cy.wrap(names).each((name) => deleteAMResource(realm, resource, name));
    });
  }
}
