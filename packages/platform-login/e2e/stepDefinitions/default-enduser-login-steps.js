/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

/**
 * Enters the username based on the given scenario.
 * @param {string} scenario - The type of scenario ('valid' for a correct username, anything else for typing 'random' as username).
 */
When('user enters a(n) {string} username', (scenario) => {
  switch (scenario) {
    case 'valid':
      cy.findByLabelText(/User Name/i, { timeout: 20000 }).should('be.visible').type(Cypress.env('endUserName'), { force: true });
      break;
    default:
      cy.findByLabelText(/User Name/i, { timeout: 20000 }).should('be.visible').type('random', { force: true });
      break;
  }
});

/**
 * Enters the password based on the given scenario.
 * @param {string} scenario - The type of scenario ('valid' for a correct password, anything else for typing 'random' as password).
 */
When('user enters a(n) {string} password', (scenario) => {
  switch (scenario) {
    case 'valid':
      cy.findAllByLabelText(/Password/i).first().should('be.visible').type(Cypress.env('endUserPassword'), { force: true });
      break;
    default:
      cy.findAllByLabelText(/Password/i).first().should('be.visible').type('random', { force: true });
      break;
  }
});

/**
 * The user clicks the Login button.
 */
Then('clicks on the Login button {int} time(s)', (numberOfAttempts) => {
  for (let i = 0; i < numberOfAttempts; i += 1) {
    cy.findByRole('button', { name: 'Next' }).click();
  }
});
