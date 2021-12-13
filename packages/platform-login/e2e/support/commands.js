/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', () => {
  const loginUrl = `${Cypress.config().baseUrl}/platform/`;
  const adminUserName = Cypress.env('AM_USERNAME');
  const adminPassword = Cypress.env('AM_PASSWORD');
  indexedDB.deleteDatabase('appAuth');
  cy.visit(loginUrl);
  cy.findByPlaceholderText(/User Name/i).type(adminUserName);
  cy.findByPlaceholderText(/Password/i).type(adminPassword, { force: true });
  cy.get('.btn-primary').click();
  if (Cypress.env('IS_FRAAS')) {
    cy.findByRole('button', { name: /Skip for now/i }).click();
  }
  cy.get('h1', { timeout: 20000 });
});

Cypress.Commands.add('logout', () => {
  cy.clearCookies();
});
