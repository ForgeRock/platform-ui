/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import '@testing-library/cypress/add-commands';

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
  cy.findByPlaceholderText(/User Name/i).type(adminUserName);
  cy.findByPlaceholderText(/Password/i).type(adminPassword, { force: true });
  cy.findByRole('button', { name: /Next/i }).click();
  if (Cypress.env('IS_FRAAS')) {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(900);
    cy.findByRole('button', { name: /Skip for now/i }).click();
  }
  cy.findAllByTestId('dashboard-welcome-title', { timeout: 20000 });
});

Cypress.Commands.add('logout', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearSessionStorage();
});
