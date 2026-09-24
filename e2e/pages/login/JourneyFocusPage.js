/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateJourneyURL } from '../../utils/journeyUtils';

/**
 * POM for the login app rendering a journey anonymously, focused on the
 * Focus First behaviour: programmatic keyboard events and raw access to the
 * currently focused element. The focused element carries the auto-focused
 * class (added by handleFocus in platform-login/src/views/Login/index.vue and
 * removed on blur), and wraps either the theme header (#appHeader) or the
 * card/main content — the caller decides which via the assertions in
 * JourneyFocusSteps. Native focus only moves on real key events, so Tab and
 * Enter are pressed through cypress-real-events, not Cypress's '{tab}'.
 */
export default class JourneyFocusPage {
  /**
   * Loads the given journey's first page anonymously (no login). The theme
   * wait guards against asserting focus before the themed layout renders.
   * The QA themes use real external logo URLs and images do not affect focus,
   * so no logo stub is needed.
   * @param {String} journeyName journey name from the JOURNEYS constants
   */
  static visit(journeyName) {
    cy.intercept('GET', '/openidm/ui/theme/**').as('getJourneyTheme');
    cy.visit(generateJourneyURL(journeyName));
    cy.wait('@getJourneyTheme', { timeout: 10000 });
  }

  static nextButton() {
    return cy.findByRole('button', { name: 'Next' });
  }

  static pressTab() {
    return cy.realPress('Tab');
  }

  static focusedElement() {
    return cy.focused();
  }
}
