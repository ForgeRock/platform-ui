/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

When('user fills security question {string} with answer {string}', (question, answer) => {
  cy.findAllByRole('combobox', { name: 'Select a security question' }).first().type(`${question}{enter}`);
  cy.findByLabelText(`Answer for: ${question}`).clear().type(answer);
});

When('user fills security question {string} with answer {string} if present', (question, answer) => {
  if (!Cypress.env('IS_FRAAS')) {
    cy.findAllByRole('combobox', { name: 'Select a security question' }).last().type(`${question}{enter}`);
    cy.findByLabelText(`Answer for: ${question}`).clear().type(answer);
  }
});

/**
 * Verifies that the registration confirmation email is sent.
 */
Then('the registration confirmation email is sent', () => {
  cy.findByText('An email has been sent to the address you entered. Click the link in that email to proceed.').should('exist');
});

Then('following password policies are not fulfilled', (dataTable) => {
  dataTable.raw().forEach((policy) => {
    cy.findByText(policy[0]).parent('li').should('not.have.class', 'fr-valid').and('not.have.class', 'opacity-50');
  });
});

Then('password policy {string} is not fulfilled', (policy) => {
  cy.findByText(policy).parent('li').should('not.have.class', 'fr-valid').and('not.have.class', 'opacity-50');
});

Then('following password policies are fulfilled', (dataTable) => {
  dataTable.raw().forEach((policy) => {
    cy.findByText(policy[0]).parent('li').should('have.class', 'fr-valid').and('have.class', 'opacity-50');
  });
});

Then('password policy {string} is fulfilled', (policy) => {
  cy.findByText(policy).parent('li').should('have.class', 'fr-valid').and('have.class', 'opacity-50');
});

Then('password field value is visible', () => {
  cy.findByLabelText('Password').should('have.class', 'password-visible');
});

Then('password field value is not visible', () => {
  cy.findByLabelText('Password').should('not.have.class', 'password-visible');
});
