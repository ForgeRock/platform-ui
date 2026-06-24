/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { createJourney, deleteAMResource, deleteIDMResource } from '@e2e/api/journeyApi.e2e';
import { deleteThemes } from '@e2e/utils/themeutils';
import { journeyCleanupManager } from '@e2e/utils/manageJourneys';
import { generateJourneyFileName } from '@e2e/utils/journeyUtils';

export default class JourneyApiSteps {
  static createdJourneyNames = [];

  static createdEmailTemplateIds = [];

  static createdThemeNames = [];

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

  /**
   * Delete every email template id tracked in `createdEmailTemplateIds`. Each entry
   * should be the bare template id (e.g. 'iam10883C3193Welcome') — NOT the prefixed
   * form 'emailTemplate/...'. Used by tests that import a fixture which creates a
   * brand-new email template so afterEach can roll the tenant back to a clean state.
   */
  static deleteCreatedEmailTemplates() {
    return cy.wrap(null).then(() => {
      if (!JourneyApiSteps.createdEmailTemplateIds.length) return cy.wrap(null);
      const ids = [...JourneyApiSteps.createdEmailTemplateIds];
      JourneyApiSteps.createdEmailTemplateIds = [];
      return cy.wrap(ids).each((id) => deleteIDMResource('config', 'emailTemplate', id));
    });
  }

  /**
   * Delete every theme name tracked in `createdThemeNames`. Used by tests that
   * import a fixture which creates a brand-new hosted-pages theme so afterEach
   * can roll the tenant back to a clean state. Themes live inside the single
   * `/openidm/config/ui/themerealm` doc, so deletion happens via a filter+PUT.
   */
  static deleteCreatedThemes() {
    return cy.wrap(null).then(() => {
      if (!JourneyApiSteps.createdThemeNames.length) return cy.wrap(null);
      const names = [...JourneyApiSteps.createdThemeNames];
      JourneyApiSteps.createdThemeNames = [];
      return deleteThemes(names);
    });
  }
}
