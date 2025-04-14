/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import generateEndUserData from '../utils/endUserData';

/**
 * Creates an end user account if does not exist with random credentials, stores the credentials in the environment variables
 */
Given('enduser account is created via API', () => {
  if (!Cypress.env('endUserId')) {
    const { userName, userPassword, userSN } = generateEndUserData();

    if (!Cypress.env('ACCESS_TOKEN')) {
      cy.loginAsAdmin();
    }

    cy.log(`Creating new IDM enduser ${userName}`).then(() => {
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
  }
});

Given('admin/enduser is logged out', () => {
  cy.logout();
  Cypress.env('ACCESS_TOKEN', '');
});

Given('admin navigates to {page} page', (page) => {
  cy.navigateToPage(page);
});

Given('admin navigates to login page', () => {
  cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
});

Given('admin navigates to {string} page url', (page) => {
  cy.intercept('GET', '/am/json/serverinfo/*').as('getServerInfo');
  cy.visit(`${Cypress.config().baseUrl}${page}`);
  cy.wait('@getServerInfo');
});

When('user types the stored value of {string} in {string} field', (envName, field) => {
  cy.findByLabelText(field).clear().type(Cypress.env(envName));
});

When('user reloads the page', () => {
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');
  cy.reload();
  cy.wait('@themerealmConfig', { timeout: 10000 });
});

When('user clicks on {string} button in {string} modal', (button, modal) => {
  cy.findByRole('dialog', { name: modal }).within(() => {
    cy.findByRole('button', { name: button }).click();
  });
});

When('user clicks on {string} button', (button) => {
  cy.findByRole('button', { name: button }).click();
});

When('user clicks on {string} link', (link) => {
  cy.findByRole('link', { name: link }).click();
});

Then('{string} button is enabled', (button) => {
  cy.findByRole('button', { name: button }).should('be.enabled');
});

Then('{string} button is disabled', (button) => {
  cy.findByRole('button', { name: button }).should('be.disabled');
});

Then('{string} modal is closed', (modal) => {
  cy.findByRole('dialog', { name: modal })
    .should('not.exist');
});

Then('notification is displayed with text {string}', (message) => {
  cy.findByRole('alert', { name: message }).should('be.visible');
});

Then('{string} error message is displayed', (message) => {
  cy.findAllByRole('alert').contains(message).should('be.visible');
});

/**
 * Deletes the end user account created in the previous step
 */
Then('enduser account is deleted via API', () => {
  if (!Cypress.env('ACCESS_TOKEN')) {
    cy.loginAsAdmin();
  }

  deleteIDMUser(Cypress.env('endUserId'));
  Cypress.env('endUserName', '');
  Cypress.env('endUserFirstName', '');
  Cypress.env('endUserLastName', '');
  Cypress.env('endUserPassword', '');
  Cypress.env('endUserId', '');
});

When('the user clears the {string} field', (field) => {
  cy.findByLabelText(field)
    .clear();
});

Then('{string} modal is displayed/opened', (modal) => {
  cy.findByRole('dialog', { name: modal })
    .should('exist');
});

When('the message {string} should be present', (message) => {
  cy.findByText(message)
    .should('be.visible');
});

When('{string} option should be present', (option) => {
  cy.findByText(option)
    .should('be.visible');
});

Then('page url contains {string}', (url) => {
  cy.url().should('include', url);
});

Then('page url does not contain {string}', (url) => {
  cy.url().should('not.include', url);
});
