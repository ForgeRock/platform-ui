/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class TermsAndConditionsJourneyPage {
  static get journeyHeading() {
    return cy.findByRole('heading', { name: 'Terms & Conditions UI Journey', level: 1 });
  }

  static get userNameInput() {
    return cy.findByLabelText('User Name', { timeout: 20000 });
  }

  static get passwordInput() {
    return cy.findByLabelText('Password');
  }

  static get nextButton() {
    return cy.findByRole('button', { name: 'Next' });
  }

  static get acceptancePrompt() {
    return cy.get('small');
  }

  // Rendered as a <button> on Cloud and as an <a href="#"> on ForgeOps — accept either.
  static get termsAndConditionsTrigger() {
    return cy.contains('button, a', 'Terms & Conditions');
  }

  static get termsModal() {
    return cy.findByRole('dialog', { name: 'Terms & Conditions', timeout: 10000 });
  }

  static get termsModalHeading() {
    return cy.findByRole('heading', { name: 'Terms & Conditions', level: 2 });
  }

  static get termsModalCloseButton() {
    return cy.findByRole('button', { name: 'Close' });
  }
}
