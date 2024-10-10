/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import '@testing-library/cypress/add-commands';
import '@neuralegion/cypress-har-generator/commands';

Cypress.Commands.add('clearSessionStorage', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

Cypress.Commands.add('clearAppAuthDatabase', () => {
  indexedDB.deleteDatabase('appAuth');
});

Cypress.Commands.add(
  'loginAsEnduser',
  (
    userName,
    password = 'Welcome1!',
    sucessLogin = true,
    loginUrl = Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/am/XUI/?realm=/alpha&authIndexType=service&authIndexValue=Login#/` : `${Cypress.config().baseUrl}/am/XUI/?realm=/&authIndexType=service&authIndexValue=Login#/`,
    givenName = 'First',
    lastName = 'Last',
  ) => {
    cy.clearAppAuthDatabase();
    cy.clearSessionStorage();

    // Set up intercept
    cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

    // Visit enduser URL
    cy.visit(loginUrl);

    // Wait for a Journey page to fully load
    cy.wait('@themerealmConfig', { timeout: 10000 });

    // Fill in Enduser name and password
    cy.findByLabelText(/User Name/i, { timeout: 10000 }).should('be.visible').type(userName, { force: true });
    cy.findAllByLabelText(/Password/i).first().should('be.visible').type(password, { force: true });
    cy.findByRole('button', { name: /Next/i }).click();

    // Wait for the spinner div to disappear
    cy.findByRole('status', { timeout: 3000 }).should('not.exist');

    // Every third Login user is asked about preferences on the default Login Journey
    cy.get('body').then(($body) => {
      // Check if "Please select your preferences" screen appears
      if ($body.find('h1:contains("Please select your preferences")').length > 0) {
        // Confirm the preferences
        cy.findByRole('button', { name: /Next/i }).click();
      }
    });

    if (sucessLogin) {
      // Check for the Dashboard welcome greeting message
      cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${givenName} ${lastName}`).should('be.visible');
    }
  },
);

Cypress.Commands.add('loginAsAdmin', () => {
  cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
  cy.clearAppAuthDatabase();
  cy.clearSessionStorage();

  cy.visit(`${Cypress.config().baseUrl}/am/XUI/`);
  cy.findByLabelText(/User Name/i, { timeout: 20000 }).should('be.visible').type(Cypress.env('AM_USERNAME'), { force: true });
  cy.findAllByLabelText(/Password/i).first().should('be.visible').type(Cypress.env('AM_PASSWORD'), { force: true });
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');
  cy.findByRole('button', { name: /Next/i }).should('be.visible').click();
  if (Cypress.env('IS_FRAAS')) {
    cy.wait('@themerealmConfig');
    cy.findByRole('status', { timeout: 3000 }).should('not.exist');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.findByRole('button', { name: /Skip for now/i }).should('be.visible').wait(100).click();
  }

  cy.wait('@getAccessToken').then(({ response }) => {
    // Use the access token from the admin login as the API access token for this test
    // Note that for code to use this access token it needs to be queued to execute
    // afterwards by Cypress with a then block or similar
    Cypress.env('ACCESS_TOKEN', response.body);
  });

  cy.findAllByTestId('dashboard-welcome-title', { timeout: 20000 }).should('be.visible');
});

Cypress.Commands.add('logout', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearSessionStorage();
});
