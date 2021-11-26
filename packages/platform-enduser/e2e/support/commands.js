/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', (userName, password = 'Welcome1', loginUrl = `${Cypress.config().baseUrl}/enduser/`) => {
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('getThemes');
  indexedDB.deleteDatabase('appAuth');
  cy.visit(loginUrl);
  cy.wait('@getThemes');
  cy.findByPlaceholderText(/User Name/i).type(userName);
  cy.findByPlaceholderText(/Password/i).type(password, { force: true });
  cy.get('.btn-primary').click();
  if (Cypress.env('IS_FRAAS')) {
    cy.findByRole('button', { name: /Skip for now/i }).click();
  }
  cy.get('h1', { timeout: 20000 });
});

Cypress.Commands.add('logout', () => {
  cy.clearCookies();
});
