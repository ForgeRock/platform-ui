/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import '@testing-library/cypress/add-commands';

Cypress.Commands.add(
  'loginAsEnduser',
  (
    userName,
    password = 'Welcome1!',
    loginUrl = Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/am/XUI/?realm=/alpha#/` : `${Cypress.config().baseUrl}/enduser/`,
  ) => {
    cy.clearAppAuthDatabase();
    cy.clearSessionStorage();

    cy.visit(loginUrl);
    cy.findByLabelText(/User Name/i).type(userName);
    cy.findAllByLabelText(/Password/i).first().type(password, { force: true });
    cy.findByRole('button', { name: /Next/i }).click();
    cy.findByTestId('dashboard-welcome-greeting', { timeout: 20000 });
  },
);

Cypress.Commands.add('clearSessionStorage', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

Cypress.Commands.add('clearAppAuthDatabase', () => {
  indexedDB.deleteDatabase('appAuth');
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
  cy.clearAppAuthDatabase();
  cy.clearSessionStorage();

  cy.visit(`${Cypress.config().baseUrl}/am/XUI/`);
  cy.findByLabelText(/User Name/i).type(Cypress.env('AM_USERNAME'));
  cy.findAllByLabelText(/Password/i).first().type(Cypress.env('AM_PASSWORD'), { force: true });
  cy.findByRole('button', { name: /Next/i }).click();
  if (Cypress.env('IS_FRAAS')) {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(900);
    cy.findByRole('button', { name: /Skip for now/i }).click();
  }
  cy.wait('@getAccessToken').then(({ response }) => {
    // Use the access token from the admin login as the API access token for this test
    // Note that for code to use this access token it needs to be queued to execute
    // afterwards by Cypress with a then block or similar
    Cypress.env('ACCESS_TOKEN', response.body);
  });

  cy.findAllByTestId('dashboard-welcome-title', { timeout: 20000 });
});

Cypress.Commands.add('logout', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearSessionStorage();
});
