/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import LoginJourneyPage from '@e2e/pages/login/LoginJourneyPage';
import { generateJourneyURL } from '@e2e/utils/journeyUtils';

export default class RequiredInputsSteps {
  /**
   * Visit a journey URL and wait for the theme to be applied to the page.
   * @param {String} journeyName the journey name based on the JOURNEYS constants file
   */
  static visit(journeyName) {
    cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
    cy.visit(generateJourneyURL(journeyName));
    cy.wait('@getTheme', { timeout: 10000 });
  }

  /**
   * Assert every given label is rendered with the red asterisk required-field
   * indicator (Login view appends
   * `<span class="text-danger" aria-hidden="true">*</span>` to required labels
   * when journeyShowAsteriskForRequiredFields is enabled).
   * @param {Array<String|RegExp>} labels field labels expected to show the asterisk
   */
  static assertAsteriskOnLabels(labels) {
    labels.forEach((label) => {
      cy.contains('label', label)
        .should('be.visible')
        .find('span.text-danger')
        .should('contain', '*');
    });
  }

  /**
   * Leave the username field empty and tab off it, then assert the
   * required-field validation message appears under the Username field.
   */
  static assertRequiredValidationMessage() {
    LoginJourneyPage.usernameInput.focus().blur();
    cy.get('.error-message').should('contain', 'is required');
  }

  /**
   * Reach the Registration journey indirectly via the 'Create an account'
   * link on the Login journey.
   */
  static goToRegistrationFromLoginJourney() {
    LoginJourneyPage.createAccountLink.should('be.visible').click();
  }
}
