/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Given, And, Then } from 'cypress-cucumber-preprocessor/steps';

function visitJourneyPage(journeyPageUrl) {
  // Set up intercept
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

  // Load base Journey URL
  cy.visit(journeyPageUrl);

  // Wait for a Journey page to fully load
  cy.wait('@themerealmConfig', { timeout: 10000 });
}

/**
 * Navigates the user to the specified page and clears any stored data.
 * This step definition allows navigation to a page that uses the base URL specified in the default block.
 * @param {string} pageName - The page to navigate to ('admin login', 'end user login', 'registration', or any other path relative to the base URL).
 */
Given('Admin/User navigates to {string} page', (page) => {
  const loginRealm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
  switch (page) {
    case 'admin login':
      cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
      break;
    case 'end user login':
      visitJourneyPage(`${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=Login`);
      break;
    case 'registration':
      visitJourneyPage(`${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=Registration`);
      break;
    case 'Scripted ConfirmationCallbacks':
      visitJourneyPage(`${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=QA%20-%20Scripted%20Decision%20Node%20with%20ConfirmationCallbacks#/`);
      break;
    default:
      cy.intercept('GET', '/am/json/serverinfo/*').as('getServerInfo');
      cy.visit(`${Cypress.config().baseUrl}${page}`);
      cy.wait('@getServerInfo');
      break;
  }
});

/**
 * Checks if the current URL path matches or not matches the expected path, based on the scenario.
 * @param {string} scenario - The scenario type ('should' or 'should not').
 * @param {string} expectedPath - The expected URL path.
 */
And('The URL path {string} contain {string}', (scenario, expectedPath) => {
  const shouldContain = scenario === 'should';

  cy.url({ timeout: 10000 }).should((actualUrl) => {
    if (shouldContain) {
      expect(actualUrl).to.contain(expectedPath);
    } else {
      expect(actualUrl).to.not.contain(expectedPath);
    }
  });
});

/**
 * Verifies that the user sees the login failure message.
 */
Then('Admin should see a login failure message', () => {
  const loginFailedErrorMessage = Cypress.env('IS_FRAAS') ? 'Login failure' : 'Authentication Failed';
  cy.findAllByRole('alert').contains(loginFailedErrorMessage);
});

/**
 * Verifies that the user is redirected to the user dashboard based on the scenario.
 *
 * @param {string} scenario - The scenario which can be 'should' or 'should not'.
 *                            'should' means the user should be redirected to the dashboard.
 *                            'should not' means the user should not be redirected to the dashboard.
 */
Then('User should see {string} error message', (errorMessage) => {
  cy.findAllByRole('alert').contains(errorMessage).should('be.visible');
});

/**
 * Verifies that the user is redirected to the user dashboard.
 */
Then('User should be redirected to User dashboard', () => {
  cy.findByRole('heading', { name: `avatar Hello, ${Cypress.env('endUserFirstName')} ${Cypress.env('endUserLastName')}` }).should('be.visible');
});

And('Cleanup {string} Journey with all dependencies', (journeyName) => {
  const fullJourneyName = `${journeyName}.json`;

  // Delete Imported Journey with all dependencies
  cy.deleteTreesViaAPI([fullJourneyName]);
});
