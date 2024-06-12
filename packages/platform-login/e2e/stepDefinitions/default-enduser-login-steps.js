/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  Then, When, Given,
} from 'cypress-cucumber-preprocessor/steps';
import { createIDMUser } from '../api/managedApi.e2e';
import generateUserData from '../utils/endUserData';

/**
 * Creates an end user account with random credentials.
 */
Given('There is an end user account created', () => {
  const { userName, userPassword, userSN } = generateUserData();
  cy.login().then(() => {
    createIDMUser({
      userName,
      password: userPassword,
      givenName: userName,
      sn: userSN,
    }).then((result) => {
      expect(result.status).to.equal(201);
      Cypress.env('endUserName', userName);
      Cypress.env('endUserFirstName', userName);
      Cypress.env('endUserLastName', userSN);
      Cypress.env('endUserPassword', userPassword);
      cy.logout();
    });
  });
});

/**
 * Enters the username based on the given scenario.
 * @param {string} scenario - The type of scenario ('valid' for a correct username, anything else for typing 'random' as username).
 */
When('User enters a(n) {string} username', (scenario) => {
  switch (scenario) {
    case 'valid':
      cy.findByLabelText(/User Name/i, { timeout: 20000 }).type(Cypress.env('endUserName'));
      break;
    default:
      cy.findByLabelText(/User Name/i, { timeout: 20000 }).type('random');
      break;
  }
});

/**
 * Enters the password based on the given scenario.
 * @param {string} scenario - The type of scenario ('valid' for a correct password, anything else for typing 'random' as password).
 */
When('User enters a(n) {string} password', (scenario) => {
  switch (scenario) {
    case 'valid':
      cy.findAllByLabelText(/Password/i).first().type(Cypress.env('endUserPassword'));
      break;
    default:
      cy.findAllByLabelText(/Password/i).first().type('random');
      break;
  }
});

/**
 * The user clicks the Login button.
 */
Then('Clicks on the Login button {int} time(s)', (numberOfAttempts) => {
  for (let i = 0; i < numberOfAttempts; i += 1) {
    cy.findByRole('button', { name: 'Next' }).click();
  }
});
