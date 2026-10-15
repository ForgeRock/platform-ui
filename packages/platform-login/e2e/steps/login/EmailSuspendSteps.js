/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { recurse } from 'cypress-recurse';
import EmailSuspendJourneyPage from '@e2e/pages/login/EmailSuspendJourneyPage';
import { generateJourneyURL } from '@e2e/utils/journeyUtils';
import { JOURNEYS } from '@e2e/support/constants';

export default class EmailSuspendSteps {
  static visit() {
    cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
    cy.visit(generateJourneyURL(JOURNEYS.EMAIL_SUSPEND_REDIRECT.name));
    cy.wait('@getTheme', { timeout: 10000 });
    EmailSuspendJourneyPage.emailInput.should('be.visible');
  }

  static submitEmail(email) {
    cy.intercept('POST', '**/authenticate*', (req) => {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      if (body.includes(email)) {
        req.alias = 'authenticateWithEmail';
      }
    });
    recurse(
      () => EmailSuspendJourneyPage.emailInput.clear().type(email, { delay: 50 }),
      ($input) => $input.val() === email,
      {
        timeout: 15000,
        delay: 500,
        log: false,
        error: 'Email input did not retain the typed value — form kept re-mounting',
      },
    );

    EmailSuspendJourneyPage.submitButton.click();
    cy.wait('@authenticateWithEmail', { timeout: 10000 });
  }

  static assertSuspendMessageVisible() {
    EmailSuspendJourneyPage.suspendMessage.should('be.visible');
  }

  static openEmailLink(url) {
    cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
    cy.intercept('POST', '**/authenticate*').as('authenticate');
    cy.visit(url);
    cy.wait('@getTheme', { timeout: 10000 });
    cy.wait('@authenticate', { timeout: 10000 });
  }

  static assertYesNoPageVisible() {
    EmailSuspendJourneyPage.yesButton.should('be.visible');
    EmailSuspendJourneyPage.noButton.should('be.visible');
  }

  static clickNo() {
    EmailSuspendJourneyPage.noButton.click();
  }

  static assertRedirectedToFailureUrl(expectedFragment) {
    cy.location().should((location) => {
      expect(location.href).to.include(expectedFragment);
      expect(location.pathname).to.eq('/am/XUI/');
    });
  }
}
