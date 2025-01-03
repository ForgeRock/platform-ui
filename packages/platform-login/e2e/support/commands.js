/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import '@neuralegion/cypress-har-generator/commands';
import { importJourneysViaAPI, deleteJourneysViaAPI } from '../utils/manageJourneys';

Cypress.Commands.add('clearSessionStorage', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

Cypress.Commands.add('clearAppAuthDatabase', () => {
  indexedDB.deleteDatabase('appAuth');
});

function clearStorage() {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.clearSessionStorage();
}

Cypress.Commands.add(
  'loginAsEnduser',
  (
    userName,
    password = 'Welcome1!',
    sucessLogin = true,
    loginUrl = Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/am/XUI/?realm=/alpha&authIndexType=service&authIndexValue=Login#/` : `${Cypress.config().baseUrl}/am/XUI/?realm=/&authIndexType=service&authIndexValue=Login#/`,
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
      cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${userName}`).should('be.visible');
    }
  },
);

Cypress.Commands.add('loginAsAdmin', () => {
  cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
  const adminUserName = Cypress.env('AM_USERNAME');
  const adminPassword = Cypress.env('AM_PASSWORD');
  cy.clearAppAuthDatabase();
  // Clear all Cookies and Storage, otherwise there might be unexpected behavior of Login after tests
  clearStorage();

  cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
  cy.findByLabelText(/User Name/i, { timeout: 20000 }).should('be.visible').type(adminUserName, { force: true });
  cy.findAllByLabelText(/Password/i).first().should('be.visible').type(adminPassword, { force: true });
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
  clearStorage();
});

/**
 * Use the admin UI tree import feature to import all trees in the passed array
 * @param {Array} fixtureArray an array containing the name of test fixture files to import as trees
 */
Cypress.Commands.add('importTrees', (fixtureArray) => {
  const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
  const treeListUrl = `${Cypress.config().baseUrl}/platform/?realm=${realm}#/journeys`;

  cy.loginAsAdmin();
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
    cy.contains('Import Complete', { timeout: 10000 }).should('be.visible');
    cy.findByRole('button', { name: 'Done' }).click();
  });
});

/**
 * !!! BEWARE !!! Use this ONLY on fixtures that do not replace any base values, scripts, Journeys, etc
 * This function overrides EVERY imported Journey including ALL dependencies using the API parsing fixtures in the passed array
 * @param {Array} fixtureArray an array containing the name of test fixture files to parse and import all dependencies
 * @param {Boolean} login a boolean to tell if tests should authenticate (in case admin is not already logged in)
 */
Cypress.Commands.add('importTreesViaAPI', (fixtureArray) => {
  // Login as admin first
  cy.loginAsAdmin();

  // Use API to import all Journeys & required data
  importJourneysViaAPI(fixtureArray);
});

/**
 * !!! BEWARE !!! Use this ONLY on fixtures that do not replace any base values, scripts, Journeys, etc
 * This function deletes EVERY imported Journey including ALL dependencies using the API parsing fixtures in the passed array
 * @param {Array} fixtureArray an array containing the name of test fixture files to parse and remove all dependencies
 * @param {Boolean} login a boolean to tell if tests should authenticate (in case admin is not already logged in)
 */
Cypress.Commands.add('deleteTreesViaAPI', (fixtureArray) => {
  // Login as admin first
  cy.loginAsAdmin();

  // Use API to delete all Journeys & required data
  deleteJourneysViaAPI(fixtureArray);
});
