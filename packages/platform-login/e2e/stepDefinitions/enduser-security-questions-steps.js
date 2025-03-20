/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import { deleteIDMUser } from '@e2e/api/managedApi.e2e';
import { setSecurityQuestionsObject } from '@e2e/utils/manageSecurityQuestions';
import { clickOnDropdown, selectDropdownOption, typeIntoField } from '@e2e/utils/uiUtils';

afterEach(() => {
  if (Cypress.spec.relative.includes('enduser-security-questions.feature')) {
    setSecurityQuestionsObject(Cypress.env('defaultSecurityQuestions'));
    if (Cypress.env('endUserId') && Cypress.env('endUserId') !== '') {
      deleteIDMUser(Cypress.env('endUserId'));
      Cypress.env('endUserId', '');
    }
    cy.logout();
  }
});

When('user clicks on the {int} {string} dropdown', (index, dropdownName) => {
  clickOnDropdown(index, dropdownName);
});

When('user types {string} on all {string} fields', (textToType, fieldsToFill) => {
  cy.findAllByLabelText(fieldsToFill).filter(':visible').each((field) => {
    cy.wrap(field).type(textToType, { force: true });
  });
});

When('user selects {string} option for the Security Question no. {int}', (optionText, questionIndex) => {
  clickOnDropdown(questionIndex, 'Select a security question');
  selectDropdownOption(optionText);
});

When('user fills all {int} custom security questions with answers', (numberOfQuestions) => {
  for (let i = 1; i <= numberOfQuestions; i += 1) {
    clickOnDropdown(i, 'Select a security question');
    selectDropdownOption('Provide your own:');
    cy.findAllByLabelText('Question').filter(':visible').eq(i - 1).type(`Question - ${i}`);
    typeIntoField(`Answer for: Question - ${i}`, 'answer');
  }
});

Then('security question dropdown and answer fields are visible {int} time(s)', (index) => {
  cy.findAllByLabelText('Select a security question').filter(':visible').should('have.length', index);
  cy.findAllByLabelText('Answer').should('have.length', index);
});

Then('the security question no. {int} has {string} option selected', (index, selectedOption) => {
  cy.findAllByLabelText('Select a security question').filter(':visible').eq(index - 1).should('contain', selectedOption);
});

Then('fields for answering to the created security questions are visible {int} time(s)', (numberOfAnswers) => {
  cy.findAllByText('Question - ', { exact: false }).filter(':visible').should('have.length', numberOfAnswers);
});

Then('all {string} fields have {string} validation error', (fieldName, validationError) => {
  cy.get(`[label="${fieldName}"]`).filter(':visible').each((field) => {
    cy.wrap(field).find('.error-message').should('have.text', validationError);
  });
});
