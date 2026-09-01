/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import TermsAndConditionsJourneyPage from '@e2e/pages/login/TermsAndConditionsJourneyPage';
import { generateJourneyURL } from '@e2e/utils/journeyUtils';
import { JOURNEYS } from '@e2e/support/constants';

export default class TermsAndConditionsSteps {
  static visit() {
    cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
    cy.visit(generateJourneyURL(JOURNEYS.ACCEPT_TERMS_AND_CONDITIONS.name));
    cy.wait('@getTheme', { timeout: 10000 });
    TermsAndConditionsJourneyPage.journeyHeading.should('be.visible');
  }

  static loginWithCredentials(userName, password) {
    TermsAndConditionsJourneyPage.userNameInput.type(userName, { force: true });
    TermsAndConditionsJourneyPage.passwordInput.type(password, { force: true });
    TermsAndConditionsJourneyPage.nextButton.click();
  }

  static assertPromptVisible() {
    TermsAndConditionsJourneyPage.acceptancePrompt
      .should('be.visible')
      .and('contain.text', "By clicking 'Next' you agree to our");
  }

  static assertPromptNotVisible() {
    TermsAndConditionsJourneyPage.acceptancePrompt.should('not.exist');
  }

  static openModal() {
    TermsAndConditionsJourneyPage.termsAndConditionsTrigger.click();
    TermsAndConditionsJourneyPage.termsModal.should('be.visible');
  }

  static assertModalContent(expectedContent) {
    TermsAndConditionsJourneyPage.termsModal.within(() => {
      TermsAndConditionsJourneyPage.termsModalHeading.should('be.visible');
      cy.findByText(expectedContent).should('be.visible');
    });
  }

  static closeModal() {
    TermsAndConditionsJourneyPage.termsModalCloseButton.click();
    TermsAndConditionsJourneyPage.termsModal.should('not.exist');
  }

  static accept() {
    TermsAndConditionsJourneyPage.nextButton.click();
  }
}
