/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { When } from '@badeball/cypress-cucumber-preprocessor';
import { createSecurityQuestion, deleteAllSecurityQuestions, setSecurityQuestionsObject } from '../utils/manageSecurityQuestions';
import { getSecurityQuestions } from '../api/securityQuestionsApi.e2e';

let defaultSecurityQuestions;

When('admin creates the following questions via API', (dataTable) => {
  const questions = {};
  dataTable.hashes().forEach((row, i) => {
    questions[i] = questions[i] || {};
    const locales = row.Locales.split(',').map((locale) => locale.trim());
    locales.forEach((locale) => {
      questions[i][locale] = row.Question;
    });
  });
  createSecurityQuestion(questions);
});

When('the admin deletes all the security questions via API', () => {
  deleteAllSecurityQuestions();
});

before(() => {
  if (Cypress.spec.relative.includes('security-questions')) {
    cy.loginAsAdmin()
      .then(() => getSecurityQuestions())
      .then((response) => {
        expect(response.status).to.equal(200);
        defaultSecurityQuestions = response.body;
        Cypress.env('defaultSecurityQuestions', defaultSecurityQuestions);
      });
  }
});

after(() => {
  if (Cypress.spec.relative.includes('security-questions')) {
    if (!defaultSecurityQuestions) {
      cy.log('No default security questions found');
      return;
    }
    cy.log('Restoring default security questions');
    setSecurityQuestionsObject(defaultSecurityQuestions);
  }
});
