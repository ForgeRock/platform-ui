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
 * Creates an end user account with random credentials, stores the credentials in the environment variables
 */
Given('enduser account is created via API', () => {
  const { userName, userPassword, userSN } = generateEndUserData();

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

Given('admin/enduser is logged out', () => {
  cy.logout();
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

/**
 * Deletes the end user account created in the previous step
 */
Then('enduser account is deleted via API', () => {
  if (!Cypress.env('ACCESS_TOKEN')) {
    cy.loginAsAdmin();
  }

  deleteIDMUser(Cypress.env('endUserId'));
});

When('user clicks on {string} Journey redirect link', (link) => {
  // Set up intercept
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

  // Click on the Journey redirect link
  cy.findByRole('link', { name: link }).click();

  // TODO: Lower this big timeout after Themes performance is resolved (10s should be more than enough even for bigger Journeys)
  // Wait for the Journey page to be properly loaded
  cy.wait('@themerealmConfig', { timeout: 20000 });
});

When('user navigates back to previous Journey page', () => {
  // Set up intercept
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

  // Go back to the previous page
  cy.go('back');

  // TODO: Lower this big timeout after Themes performance is resolved (10s should be more than enough even for bigger Journeys)
  // Wait for the Journey page to be properly loaded
  cy.wait('@themerealmConfig', { timeout: 20000 });
});
