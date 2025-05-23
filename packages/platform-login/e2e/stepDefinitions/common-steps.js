/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { generateJourneyURL } from '@e2e/utils/journeyUtils';

When('user navigates to journey {journey} url with param {string} and value {string}', (journeyName, param, paramValue) => {
  const journeyUrl = generateJourneyURL(journeyName);
  const joureyUrlWithParams = `${journeyUrl}&${param}=${paramValue}`;
  cy.visitJourneyUrl(joureyUrlWithParams);
});

When('cleanup {string} Journey with all dependencies', (journeyName) => {
  const fullJourneyName = `${journeyName}.json`;

  // Delete Imported Journey with all dependencies
  cy.deleteTreesViaAPI([fullJourneyName]);
});

/**
 * Verifies that the user is redirected to the user dashboard.
 */
Then('user should be redirected to User dashboard', () => {
  cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${Cypress.env('endUserFirstName')} ${Cypress.env('endUserLastName')}`).should('be.visible');
});
