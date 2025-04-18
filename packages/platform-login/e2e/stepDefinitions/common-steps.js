/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import generateJourneyURL from '../../../../e2e/utils/journeyUtils';

Given('user navigates to {journey} journey', (journeyName) => {
  const url = generateJourneyURL(journeyName);
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');
  cy.visit(url);
  cy.wait('@themerealmConfig', { timeout: 10000 });
});

When('cleanup {string} Journey with all dependencies', (journeyName) => {
  const fullJourneyName = `${journeyName}.json`;

  // Delete Imported Journey with all dependencies
  cy.deleteTreesViaAPI([fullJourneyName]);
});

When('user navigates back', () => {
  cy.go('back');
});

/**
 * Verifies that the user sees the login failure message.
 */
Then('admin should see a login failure message', () => {
  cy.findAllByRole('alert').contains('Login failure').should('be.visible');
});

/**
 * Verifies that the user is redirected to the user dashboard based on the scenario.
 *
 * @param {string} scenario - The scenario which can be 'should' or 'should not'.
 *                            'should' means the user should be redirected to the dashboard.
 *                            'should not' means the user should not be redirected to the dashboard.
 */
Then('user should see {string} error message', (errorMessage) => {
  cy.findAllByRole('alert').contains(errorMessage).should('be.visible');
});

/**
 * Verifies that the user is redirected to the user dashboard.
 */
Then('user should be redirected to User dashboard', () => {
  cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${Cypress.env('endUserFirstName')} ${Cypress.env('endUserLastName')}`).should('be.visible');
});

Then('page title is {string}', (title) => {
  // TODO: Remove this big timeout after Themes performance is resolved (default 5s should be enough)
  cy.findByRole('heading', { name: title, timeout: 10000 }).should('be.visible');
});

Then('text {string} is displayed', (message) => {
  cy.findByText(message).should('be.visible');
});

Then('page url contains {string}', (url) => {
  cy.url().should('include', url);
});

Then('page url does not contain {string}', (url) => {
  cy.url().should('not.include', url);
});

Then('link {string} is displayed', (link) => {
  cy.findByRole('link', { name: link }).should('be.visible');
});

Then('{string} field has {string} validation error', (field, validationError) => {
  cy.findByLabelText(field).get('.error-message').should('have.text', validationError);
});
