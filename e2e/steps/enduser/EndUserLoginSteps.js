/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateJourneyURL } from '../../utils/journeyUtils';
import { JOURNEYS } from '../../support/constants';

export default class LoginSteps {
  static loginAsDefaultEnduser() {
    return cy.wrap(null).then(() => cy.loginAsEnduser(Cypress.env('endUserName'), Cypress.env('endUserPassword'), false));
  }

  static visitLoginJourney() {
    const url = generateJourneyURL(JOURNEYS.DEFAULT_LOGIN.name);
    cy.visit(url);
  }

  static logout() {
    cy.logout();
  }

  /**
   * Assert the enduser has landed on their dashboard. The greeting heading varies by tenant:
   *   - default cloud / forgeops: `Hello, {name}`
   *   - governance tenants:       `Good Morning|Afternoon|Evening {givenName}!`
   * Both contain the user's name, so we match on that alone.
   */
  static assertOnDashboard(userName) {
    cy.findAllByRole('heading', { level: 1, timeout: 20000 })
      .filter(`:contains("${userName}")`)
      .should('be.visible');
  }
}
