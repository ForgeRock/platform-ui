/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class EmailSuspendJourneyPage {
  static get emailInput() {
    return cy.findByRole('textbox', { name: /mail|email/i, timeout: 20000 });
  }

  static get submitButton() {
    return cy.findByRole('button', { name: /^(next|sign in)$/i });
  }

  static get suspendMessage() {
    return cy.findByTestId('suspend-text-output');
  }

  static get yesButton() {
    return cy.findByRole('button', { name: 'Yes' });
  }

  static get noButton() {
    return cy.findByRole('button', { name: 'No' });
  }
}
