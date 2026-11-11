/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

/**
 * The policy list has two display modes: legacy (met policies get fr-valid +
 * opacity-50 on the li) and checkmark (met policies render the green "check"
 * material icon inside the li). The default Registration journey enables
 * checkmark mode while other journeys keep the legacy list, so accept both.
 * should() with a callback retries until the panel reflects the last input.
 * @param {String} policy policy text as shown in the policy list
 * @param {Boolean} fulfilled whether the policy is expected to be met
 */
function assertPolicyFulfilled(policy, fulfilled) {
  cy.findByText(policy).parent('li').should(($li) => {
    const legacyMet = $li.hasClass('fr-valid');
    const checkmarkMet = $li.find('.text-success').text() === 'check';
    const met = legacyMet || checkmarkMet;
    expect(met, `${policy} is${fulfilled ? '' : ' not'} fulfilled`).to.equal(fulfilled);
  });
}

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
    assertPolicyFulfilled(policy[0], false);
  });
});

Then('password policy {string} is not fulfilled', (policy) => {
  assertPolicyFulfilled(policy, false);
});

Then('following password policies are fulfilled', (dataTable) => {
  dataTable.raw().forEach((policy) => {
    assertPolicyFulfilled(policy[0], true);
  });
});

Then('password policy {string} is fulfilled', (policy) => {
  assertPolicyFulfilled(policy, true);
});

Then('password field value is visible', () => {
  cy.findByLabelText('Password').should('have.class', 'password-visible');
});

Then('password field value is not visible', () => {
  cy.findByLabelText('Password').should('not.have.class', 'password-visible');
});
