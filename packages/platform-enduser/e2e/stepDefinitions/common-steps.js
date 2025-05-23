/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Given, When } from '@badeball/cypress-cucumber-preprocessor';
import { generateJourneyURL } from '@e2e/utils/journeyUtils';

Given('enduser logs into {journey} journey', (journeyName) => {
  const userName = Cypress.env('endUserName');
  const password = Cypress.env('endUserPassword');
  const successLogin = true;
  const loginUrl = generateJourneyURL(journeyName);
  const givenName = Cypress.env('endUserFirstName');

  cy.loginAsEnduser(
    userName,
    password,
    successLogin,
    loginUrl,
    givenName,
  );
});

Given('browser locale is set to {string}', (locale) => {
  const localesList = locale.split(',');
  Cypress.env('LOCALESLIST', localesList);
  Cypress.env('LOCALE', localesList[0]);
});

When('user clicks on {string} tab', (page) => {
  cy.findByRole('link', { name: page }).click();
});
