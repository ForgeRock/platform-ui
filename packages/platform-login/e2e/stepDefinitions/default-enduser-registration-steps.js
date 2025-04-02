/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { random } from 'lodash';

When('user fills registration form with following data', (dataTable) => {
  dataTable.hashes().forEach((row) => {
    cy.findByLabelText(row.Field).clear().type(row.Value);
  });
});

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
 * Fills out the registration form with specified credentials.
 * @param {string} scenario - The type of credentials to use ('valid' or 'invalid').
 */
When('user fills out the default registration form with {string} credentials', (scenario) => {
  const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
  const fieldData = [
    {
      placeholder: 'Username',
      text: userName,
    },
    {
      placeholder: 'First Name',
      text: 'newTest',
    },
    {
      placeholder: 'Last Name',
      text: 'User1',
    },
    {
      placeholder: 'Email Address',
      text: 'newTestUser1@test.com',
    },
  ];

  Cypress.env('endUserFirstName', fieldData[1].text);
  Cypress.env('endUserLastName', fieldData[2].text);

  fieldData.forEach((field) => {
    cy.findByLabelText(field.placeholder)
      .clear()
      .type(field.text);
  });

  cy.findAllByRole('combobox').first().click();
  cy.findAllByText('What\'s your favorite color?').first().click();
  cy.findAllByLabelText('Answer for: What\'s your favorite color?').first().clear().type('orange');
  if (!Cypress.env('IS_FRAAS')) {
    cy.findAllByRole('combobox').last().click();
    cy.findAllByText('Who was your first employer?').last().click();
    cy.findAllByLabelText('Answer for: Who was your first employer?').last().clear().type('ForgeRock');
  }

  switch (scenario) {
    case 'valid':
      cy.findAllByLabelText(/Password/i).first().clear().type('Rg_GRg9k&e');
      break;
    case 'invalid':
      // set long passwords - check policy
      cy.findAllByLabelText(/Password/i).first().clear().type('longenoughtopass');
      break;
    default:
      console.error('invalid step');
  }
});

/**
 * Submits the registration form.
 */
When('user submits the registration form', () => {
  cy.findByRole('button', { name: 'Next' }).click({ force: true });
});

/**
 * Verifies there is displayed an error indicating that the password should be at least of the lenght provided
 * Message displayed on UI says "Must be at least n characters long", being n the number provided here
 * @param {int} charactersExpected The number of characters expected, displayed by UI error message
 */
Then('user should see an error indicating password should be at least {int} characters long', (charactersExpected) => {
  cy.get(`li:contains("Must be at least ${charactersExpected} characters long")`)
    .should('have.class', 'fr-valid');
});

/**
 * Verifies that the registration confirmation email is sent.
 */
Then('the registration confirmation email is sent', () => {
  cy.findByText('An email has been sent to the address you entered. Click the link in that email to proceed.').should('exist');
});
