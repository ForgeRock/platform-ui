/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class RegistrationSteps {
  /**
   * A completed registration journey auto-authenticates the new user and redirects
   * into the enduser app — the redirect itself proves the session exists.
   * Then wait for the dashboard to load to ensure backend registration has completed.
   */
  static assertUserIsRegistered() {
    cy.location('pathname').should('eq', '/enduser/');
    cy.url({ timeout: 20000 }).should('contain', '#/dashboard');
  }

  static assertErrorAlertIsVisible(message) {
    cy.findByTestId('FrAlert').should('be.visible').and('contain.text', message);
  }
}
