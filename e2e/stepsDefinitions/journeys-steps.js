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
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');
  cy.findByRole('link', { name: link }).click();
  // TODO: Lower this big timeout after Themes performance is resolved (10s should be more than enough even for bigger Journeys)
  cy.wait('@themerealmConfig', { timeout: 20000 });
});

When('user navigates back to previous Journey page', () => {
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');
  cy.go('back');
  // TODO: Lower this big timeout after Themes performance is resolved (10s should be more than enough even for bigger Journeys)
  cy.wait('@themerealmConfig', { timeout: 20000 });
});
