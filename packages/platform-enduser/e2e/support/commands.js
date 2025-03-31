/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import '@testing-library/cypress/add-commands';
import '@neuralegion/cypress-har-generator/commands';

// Method that fills in the Admin Login form and sends it
function fillAndSendLoginForm() {
  const adminUserName = Cypress.env('AM_USERNAME');
  const adminPassword = Cypress.env('AM_PASSWORD');

  // Fill in Admin name and password and Login
  cy.findByLabelText(/User Name/i, { timeout: 5000 }).should('be.visible').type(adminUserName, { force: true });
  cy.findAllByLabelText(/Password/i).first().should('be.visible').type(adminPassword, { force: true });
  cy.findByRole('button', { name: /Next/i }).should('be.visible').click();

  // Skip 2FA on Cloud Tenants
  if (Cypress.env('IS_FRAAS')) {
    cy.wait('@themerealmConfig');
    cy.findByRole('status', { timeout: 3000 }).should('not.exist');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.findByRole('button', { name: /Skip for now/i }).should('be.visible').wait(100).click();
  }
}

// Method to fetch ACCESS_TOKEN with retry option
function fetchAccessToken(retries = 5, attempt = 0) {
  let retry = attempt;
  cy.wait('@getAccessToken').then(({ response }) => {
    // Fetch ACCESS_TOKEN only if the response is successful and the IDM scope is correct
    if (response.statusCode === 200 && response.body.scope === Cypress.env('IS_FRAAS') ? 'fr:idm:*' : 'openid fr:idm:*') {
      // Use the access token from the admin login as the API access token for this test
      // Note that for code to use this access token it needs to be queued to execute
      // afterwards by Cypress with a then block or similar
      cy.log('ACCESS_TOKEN fetched successfully');
      Cypress.env('ACCESS_TOKEN', response.body);
    } else if (retry < retries) {
      retry += 1;
      cy.log(`Failed to fetch ACCESS_TOKEN (${response.statusCode}), retrying attempt ${retry}...`);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(200);
      fetchAccessToken(retries, retry);
    } else {
      throw new Error(`Failed to fetch ACCESS_TOKEN after ${retries} attempts!`);
    }
  });
}

Cypress.Commands.add('clearSessionStorage', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

Cypress.Commands.add('clearAppAuthDatabase', () => {
  indexedDB.deleteDatabase('appAuth');
});

Cypress.Commands.add('logout', () => {
  cy.clearAppAuthDatabase();
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearSessionStorage();
});

Cypress.Commands.add(
  'loginAsEnduser',
  (
    userName,
    password = 'Rg_GRg9k&e',
    sucessLogin = true,
    loginUrl = Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/am/XUI/?realm=/alpha&authIndexType=service&authIndexValue=Login#/` : `${Cypress.config().baseUrl}/am/XUI/?realm=/&authIndexType=service&authIndexValue=Login#/`,
    givenName = 'First',
  ) => {
    // Clear cookies and local storage
    cy.logout();

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
      cy.findAllByRole('heading', { timeout: 20000 }).contains(givenName).should('be.visible');
    }
  },
);

Cypress.Commands.add('loginAsAdmin', () => {
  const loginUrl = `${Cypress.config().baseUrl}/platform/`;

  // Clear cookies and local storage
  cy.logout();

  // Set up intercept
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');
  cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
  cy.intercept('GET', 'environment/release').as('getRelease');

  // Visit Admin Login URL
  cy.visit(loginUrl);

  // Wait for the Login form to load
  cy.wait('@themerealmConfig', { timeout: 15000 });

  // Fill in Admin name and password and Login
  fillAndSendLoginForm();

  // Access token sometimes failes to fetch on first attempt causing unwanted failures
  fetchAccessToken();

  // Wait for Dashboard to load
  cy.findAllByTestId('dashboard-welcome-title', { timeout: 15000 }).should('be.visible');

  if (Cypress.env('IS_FRAAS')) {
    // Wait for the Cloud to properly load
    cy.wait('@getRelease', { timeout: 10000 });
  }
});
