/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { importJourneysViaAPI, deleteJourneysViaAPI } from '../../../../e2e/utils/manageJourneys';

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
