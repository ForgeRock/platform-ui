/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * POM for a login journey that renders social IDP choice buttons
 * (SelectIdPCallback). Buttons are rendered as plain buttons labelled
 * "Sign in with {buttonDisplayName}" via the `login.social.signInWith`
 * locale key, so they are located by accessible role/name.
 * Selectors and raw actions only — no assertions live here.
 */
export default class SocialLoginJourneyPage {
  /**
   * Social IDP button by provider display name, e.g. 'Google' or 'Facebook'
   * resolves to the "Sign in with Google" button.
   * SelectIdPCallback renders the provider buttons only once the first
   * authenticate round-trip resolves, hence the generous timeout.
   * @param {String} providerName display name shown on the button
   * @returns {Cypress.Chainable} the social sign-in button
   */
  static socialButton(providerName) {
    return cy.findByRole('button', { name: `Sign in with ${providerName}`, timeout: 20000 });
  }

  static get googleButton() {
    return this.socialButton('Google');
  }

  static get facebookButton() {
    return this.socialButton('Facebook');
  }

  /**
   * Username input on a rendered login journey page.
   * @returns {Cypress.Chainable} the username field
   */
  static get usernameField() {
    return cy.findByLabelText('User Name', { timeout: 20000 });
  }
}
