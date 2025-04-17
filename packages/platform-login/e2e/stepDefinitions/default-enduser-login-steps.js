/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { When } from '@badeball/cypress-cucumber-preprocessor';

When('user tries to login {int} times with {string} username and {string} password', (numberOfAttempts, userName, password) => {
  for (let i = 0; i < numberOfAttempts; i += 1) {
    cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
    if (userName !== 'empty') { cy.findByLabelText('User Name').clear().type(Cypress.env(userName) ? Cypress.env(userName) : userName); }
    if (password !== 'empty') { cy.findByLabelText('Password').clear().type(Cypress.env(password) ? Cypress.env(password) : password); }
    cy.findByRole('button', { name: 'Next' }).click();
    cy.wait('@getTheme', { timeout: 10000 });
  }
});
