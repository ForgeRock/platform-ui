/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';

Cypress.Commands.add('clearSessionStorage', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

Cypress.Commands.add('clearAppAuthDatabase', () => {
  indexedDB.deleteDatabase('appAuth');
});

Cypress.Commands.add('login', () => {
  const loginUrl = `${Cypress.config().baseUrl}/platform/`;
  const adminUserName = Cypress.env('AM_USERNAME');
  const adminPassword = Cypress.env('AM_PASSWORD');
  cy.clearAppAuthDatabase();
  cy.clearSessionStorage();

  cy.visit(loginUrl);
  cy.findByLabelText(/User Name/i, { timeout: 20000 }).type(adminUserName);
  cy.findAllByLabelText(/Password/i).first().type(adminPassword, { force: true });
  cy.findByRole('button', { name: /Next/i }).click();
  if (Cypress.env('IS_FRAAS')) {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1200);
    cy.findByRole('button', { name: /Skip for now/i, timeout: 5000 }).click();
  }
  cy.findAllByTestId('dashboard-welcome-title', { timeout: 20000 });
});

Cypress.Commands.add('logout', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearSessionStorage();
});

/**
 * Use the admin UI tree import feature to import all trees in the passed array
 * @param {Array} fixtureArray an array containing the name of test fixture files to import as trees
 */
Cypress.Commands.add('importTrees', (fixtureArray) => {
  const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
  const treeListUrl = `${Cypress.config().baseUrl}/platform/?realm=${realm}#/journeys`;

  cy.login();
  cy.visit(treeListUrl);

  fixtureArray.forEach((fixtureName) => {
    cy.findByRole('button', { name: 'Import', timeout: 20000 }).click();
    cy.findByRole('dialog', { name: 'Import Journeys' }).within(() => {
      cy.findByRole('button', { name: 'Skip Backup', timeout: 25000 }).should('be.enabled').click();
    });
    cy.findByRole('button', { name: 'Skip Backup' }).click();

    // Use the test fixture as upload data
    cy.get('[type="file"]').attachFile(fixtureName);
    cy.findByRole('button', { name: 'Next' }).should('be.enabled').click();
    cy.findByRole('button', { name: 'Start Import' }).should('be.enabled').click();
    cy.contains('Import Complete').should('be.visible');
    cy.findByRole('button', { name: 'Done' }).click();
  });
});
