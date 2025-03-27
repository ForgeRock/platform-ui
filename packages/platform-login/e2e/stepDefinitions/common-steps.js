/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import generateEnduserData from '../utils/endUserData';

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
Given('admin/user navigates to {string} page', (page) => {
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

When('cleanup {string} Journey with all dependencies', (journeyName) => {
  const fullJourneyName = `${journeyName}.json`;

  // Delete Imported Journey with all dependencies
  cy.deleteTreesViaAPI([fullJourneyName]);
});

When('user reloads the page', () => {
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');
  cy.reload();
  cy.wait('@themerealmConfig', { timeout: 10000 });
});

When('user clicks on {string} link', (link) => {
  cy.findByRole('link', { name: link }).click();
});

When('user clicks on {string} button', (button) => {
  cy.findByRole('button', { name: button }).click();
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
  cy.findByRole('heading', { name: title }).should('be.visible');
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

Then('{string} button is enabled', (button) => {
  cy.findByRole('button', { name: button }).should('be.enabled');
});

Then('{string} button is disabled', (button) => {
  cy.findByRole('button', { name: button }).should('be.disabled');
});

Then('{string} field has {string} validation error', (field, validationError) => {
  cy.findByLabelText(field).get('.error-message').should('have.text', validationError);
});

/**
 * Creates an end user account with random credentials, stores the credentials in the environment variables
 */
Given('Enduser account is created via API', () => {
  const { userName, userPassword, userSN } = generateEnduserData();

  if (!Cypress.env('ACCESS_TOKEN')) {
    cy.loginAsAdmin();
  }

  cy.log(`Creating new IDM Enduser ${userName}...`).then(() => {
    createIDMUser({
      userName,
      password: userPassword,
      givenName: userName,
      sn: userSN,
    }).then((result) => {
      expect(result.status).to.equal(201);
      Cypress.env('endUserName', userName);
      Cypress.env('endUserFirstName', userName);
      Cypress.env('endUserLastName', userSN);
      Cypress.env('endUserPassword', userPassword);
      Cypress.env('endUserId', result.body._id);
    });
  });
});

/**
 * Deletes the end user account created in the previous step
 */
Then('Enduser account is deleted via API', () => {
  if (!Cypress.env('ACCESS_TOKEN')) {
    cy.loginAsAdmin();
  }

  deleteIDMUser(Cypress.env('endUserId'));
});

Then('Admin/Enduser is logged out', () => {
  cy.logout();
});
