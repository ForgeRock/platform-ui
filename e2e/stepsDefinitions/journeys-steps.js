/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { Given, When } from '@badeball/cypress-cucumber-preprocessor';
import { generateJourneyFileName } from '../utils/journeyUtils';

this.importedJourneys = [];

after(() => {
  if (this.importedJourneys.length > 0) {
    const journeysToDelete = this.importedJourneys.map((journey) => journey.fileName);
    cy.log(`Deleting imported journey(s) ${journeysToDelete} via API`).then(() => {
      cy.deleteTreesViaAPI(journeysToDelete);
      this.importedJourneys = [];
    });
  }
});

Given('journey {journey} is imported via API', (name) => {
  const importedJourney = this.importedJourneys.find((journey) => journey.name === name);
  if (!importedJourney) {
    const fileName = generateJourneyFileName(name);
    cy.importTreesViaAPI([fileName]);
    this.importedJourneys.push({ name, fileName });
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
