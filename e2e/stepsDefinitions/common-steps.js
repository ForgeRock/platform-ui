/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
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
