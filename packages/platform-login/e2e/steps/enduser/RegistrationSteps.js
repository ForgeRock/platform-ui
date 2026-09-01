/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import RegistrationJourneyPage from '@e2e/pages/enduser/RegistrationJourneyPage';
import apiSteps from '@e2e/steps/apiSteps';
import { generateJourneyURL } from '@e2e/utils/journeyUtils';
import { JOURNEYS } from '@e2e/support/constants';
import { recurse } from 'cypress-recurse';
import { extractLinkFromEmail } from '../../utils/emailUtils';

// Cloud renders a single KBA (color). ForgeOps renders two (color + first employer).
const KBA_COLOR = { question: "What's your favorite color?", answer: 'orange' };
const KBA_EMPLOYER = { question: 'Who was your first employer?', answer: 'ForgeRock' };

function selectKba(position, { question, answer }) {
  RegistrationJourneyPage.kbaQuestionCombobox(position).click();
  RegistrationJourneyPage.kbaQuestionOption(question, position).click();
  RegistrationJourneyPage.kbaAnswerInput(question, position).clear().type(answer);
}

export default class RegistrationSteps {
  static navigate() {
    cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
    cy.visit(generateJourneyURL(JOURNEYS.DEFAULT_REGISTRATION.name));
    cy.wait('@getTheme', { timeout: 10000 });
  }

  static fillForm({
    username, firstName, lastName, email, password,
  }) {
    RegistrationJourneyPage.usernameInput.clear().type(username);
    RegistrationJourneyPage.firstNameInput.clear().type(firstName);
    RegistrationJourneyPage.lastNameInput.clear().type(lastName);
    RegistrationJourneyPage.emailInput.clear().type(email);
    RegistrationJourneyPage.passwordInput.clear().type(password);
    selectKba('first', KBA_COLOR);
    if (!Cypress.env('IS_FRAAS')) {
      selectKba('last', KBA_EMPLOYER);
    }
  }

  /**
   * Submit the registration form and wait until the user lands on `/enduser/`.
   * Cloud requires an email verification step (suspend node → link click);
   * ForgeOps completes registration in a single submit — this method handles both.
   * @param {Object} emailAccount test email account (only used on Cloud)
   */
  static submitAndComplete(emailAccount) {
    const sessionInfoUrl = Cypress.env('IS_FRAAS')
      ? '/am/json/realms/root/realms/alpha/sessions?_action=getSessionInfo'
      : '/am/json/realms/root/sessions?_action=getSessionInfo';
    cy.intercept('POST', sessionInfoUrl).as('registrationSessionInfo');

    RegistrationJourneyPage.submitButton.click();

    if (Cypress.env('IS_FRAAS')) {
      RegistrationJourneyPage.suspendMessage.contains(
        'An email has been sent to the address you entered. Click the link in that email to proceed.',
      );
      recurse(
        () => cy.task('getLatestEmail', emailAccount),
        Cypress._.isObject,
        { timeout: 5000, delay: 1000 },
      ).then((emailObject) => {
        cy.visit(extractLinkFromEmail(emailObject.body));
      });
    }

    return cy.wait('@registrationSessionInfo', { timeout: 20000 }).then(({ response }) => {
      apiSteps.user.createdUserIds.push(response.body.username);
      cy.location('pathname').should('eq', '/enduser/');
    });
  }
}
