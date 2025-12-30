/**
 * Copyright 2025-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { Given, When } from '@badeball/cypress-cucumber-preprocessor';
import { generateJourneyFileName } from '../utils/journeyUtils';
import { journeyCleanupManager } from '../utils/manageJourneys';

after(() => {
  journeyCleanupManager.cleanup();
});

Given('journey {journey} is imported via API', (name) => {
  const importedJourney = journeyCleanupManager.getAll().find((journey) => journey.name === name);
  if (!importedJourney) {
    const fileName = generateJourneyFileName(name);
    cy.importTreesViaAPI([fileName]).then(() => {
      journeyCleanupManager.add({ name, fileName });
    });
  }
});

When('user clicks on {string} Journey redirect link', (link) => {
  cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
  cy.findByRole('link', { name: link }).click();
  cy.wait('@getTheme', { timeout: 10000 });
});

When('user navigates back to previous Journey page', () => {
  cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
  cy.go('back');
  cy.wait('@getTheme', { timeout: 10000 });
});
