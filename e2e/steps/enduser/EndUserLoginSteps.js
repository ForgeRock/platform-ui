/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateJourneyURL } from '../../utils/journeyUtils';
import { JOURNEYS } from '../../support/constants';
import JourneyPage from '../../pages/login/JourneyPage';

export default class LoginSteps {
  static loginAsDefaultEnduser() {
    return cy.wrap(null).then(() => cy.loginAsEnduser(Cypress.env('endUserName'), Cypress.env('endUserPassword'), false));
  }

  static visitLoginJourney() {
    const url = generateJourneyURL(JOURNEYS.DEFAULT_LOGIN.name);
    cy.visit(url);
  }

  /**
   * Loads the given journey's sign-in page anonymously (no login), stubbing
   * the given logo src fragment with a real image so the theme logo renders
   * instead of the broken-image placeholder. Visiting the given journey (not
   * necessarily the default Login journey) is what makes the login app
   * resolve the journey's theme via its linkedTrees filter.
   * @param {String} journeyName journey name from the JOURNEYS constants
   * @param {String} logoUrlFragment fragment of the logo src URL to stub
   */
  static visitJourneyWithStubbedLogo(journeyName, logoUrlFragment) {
    JourneyPage.visitWithStubbedLogo(journeyName, logoUrlFragment);
  }

  /**
   * Asserts the theme logo rendered on the sign-in page with the expected
   * URL fragment, alt text, and that it actually decoded as an image
   * (naturalWidth > 0) rather than the broken-image placeholder.
   * @param {String} urlFragment fragment the rendered img src must contain
   * @param {String} altText expected img alt attribute
   */
  static assertLogoRendered(urlFragment, altText) {
    JourneyPage.logo(urlFragment).should('be.visible');
    JourneyPage.logo(urlFragment).should('have.attr', 'src').and('include', urlFragment);
    JourneyPage.logo(urlFragment).should('have.attr', 'alt', altText);
    JourneyPage.logo(urlFragment).should('have.prop', 'naturalWidth').and('be.greaterThan', 0);
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
