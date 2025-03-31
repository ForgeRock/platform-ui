/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Given, When } from '@badeball/cypress-cucumber-preprocessor';

Given('{string} is logged in', (username) => {
  cy.loginAsEnduser(username === 'Enduser' ? Cypress.env('endUserName') : username);
});

Given('{string} is logged in to {string} journey', (username, journey) => {
  let journeyPath;
  switch (journey) {
    case 'All sections active':
      journeyPath = 'QA%20-%20Default%20Login%20with%20all%20enduser%20sections%20active';
      break;
    default:
      break;
  }

  const loginUrl = Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/am/XUI/?realm=/alpha&authIndexType=service&authIndexValue=${journeyPath}#/` : `${Cypress.config().baseUrl}/am/XUI/?realm=/&authIndexType=service&authIndexValue=${journeyPath}#/`;

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

When('user reloads the page', () => {
  cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');
  cy.reload();
  cy.wait('@themerealmConfig', { timeout: 10000 });
});

When('user clicks on {string} button', (button) => {
  cy.findByRole('button', { name: button }).click();
});
