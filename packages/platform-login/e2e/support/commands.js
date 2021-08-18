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
  cy.get('[placeholder="User Name:"]').type(adminUserName);
  cy.get('[placeholder="Password:"]').type(adminPassword, { force: true });
  cy.get('.btn-primary').click();
  cy.get('h1', { timeout: 20000 });
});

Cypress.Commands.add('logout', () => {
  cy.clearCookies();
});
