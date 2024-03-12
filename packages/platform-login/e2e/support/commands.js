/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import '@testing-library/cypress/add-commands';
import 'cypress-file-upload';
import '@neuralegion/cypress-har-generator/commands';
import {
  deleteAMJourney,
  deleteIDMTheme,
  deleteIDMEmailTemplate,
  deleteAMSocialProviderNode,
  deleteAMScript,
} from '../api/journeyApi.e2e';

Cypress.Commands.add('clearSessionStorage', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

Cypress.Commands.add('clearAppAuthDatabase', () => {
  indexedDB.deleteDatabase('appAuth');
});

Cypress.Commands.add('login', () => {
  cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
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
    cy.contains('Import Complete', { timeout: 10000 }).should('be.visible');
    cy.findByRole('button', { name: 'Done' }).click();
  });
});

/**
 * !!! BEWARE !!! Use this ONLY on fixtures that do not replace any base values, scripts, Journeys, etc
 * This function deletes EVERY imported Journey including ALL dependencies using the API parsing fixtures in the passed array
 * @param {Array} fixtureArray an array containing the name of test fixture files to parse and remove all dependencies
 * @param {Boolean} login a boolean to tell if tests should authenticate (in case admin is not already logged in)
 */
Cypress.Commands.add('deleteTreesViaAPI', (fixtureArray, login = false) => {
  if (login) {
    cy.login();
  }

  fixtureArray.forEach((fixtureName) => {
    const fixture = `e2e/fixtures/${fixtureName}`;
    // Read Fixture file
    cy.readFile(fixture).then((fixtureData) => {
      // Delete Journey itself first
      const journeyName = Object.keys(fixtureData.trees)[0].replace(' ', '%20');
      deleteAMJourney([journeyName]);

      // Then delete everything else in correct order
      // Delete all Themes
      const fixtureObj = Object.values(fixtureData.trees)[0];
      fixtureObj.themes.forEach((theme) => {
        deleteIDMTheme(theme.name);
      });

      // Delete all Email Templates
      Object.keys(fixtureObj.emailTemplates).forEach((emailTemplate) => {
        deleteIDMEmailTemplate(emailTemplate);
      });

      // Delete all Social Identity Providers
      Object.keys(fixtureObj.socialIdentityProviders).forEach((socialIdentityProvider) => {
        deleteAMSocialProviderNode(socialIdentityProvider);
      });

      // Delete all Scripts
      Object.keys(fixtureObj.scripts).forEach((script) => {
        deleteAMScript(script);
      });
    });
  });
});
