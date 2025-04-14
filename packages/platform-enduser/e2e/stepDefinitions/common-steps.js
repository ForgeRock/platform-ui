/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Given, When } from '@badeball/cypress-cucumber-preprocessor';
import { generateJourneyURL } from '@e2e/utils/journeyUtils';

Given('{string} is logged in', (username) => {
  cy.loginAsEnduser(username === 'Enduser' ? Cypress.env('endUserName') : username);
});

Given('{string} logs into {journey} journey', (username, journeyName) => {
  const loginUrl = generateJourneyURL(journeyName);
  cy.loginAsEnduser(username === 'Enduser' ? Cypress.env('endUserName') : username, 'Rg_GRg9k&e', true, loginUrl);
});

Given('browser locale is set to {string}', (locale) => {
  const localesList = locale.split(',');
  Cypress.env('LOCALESLIST', localesList);
  Cypress.env('LOCALE', localesList[0]);
});

When('user clicks on {string} tab', (page) => {
  cy.findByRole('link', { name: page }).click();
});
