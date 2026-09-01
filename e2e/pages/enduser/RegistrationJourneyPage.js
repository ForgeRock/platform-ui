/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class RegistrationJourneyPage {
  static get heading() {
    return cy.findByRole('heading', { level: 1 });
  }

  static get usernameInput() {
    return cy.findByLabelText(/username/i);
  }

  static get firstNameInput() {
    return cy.findByLabelText(/first name/i);
  }

  static get lastNameInput() {
    return cy.findByLabelText(/last name/i);
  }

  static get emailInput() {
    return cy.findByLabelText(/email address/i);
  }

  static get passwordInput() {
    return cy.findAllByLabelText(/password/i).first();
  }

  static get showPasswordButton() {
    return cy.findByRole('button', { name: /show password/i });
  }

  static get nextButton() {
    return cy.findByRole('button', { name: /next/i });
  }

  static get submitButton() {
    return cy.get('[type="submit"]');
  }

  // KBA — Cloud renders one question, ForgeOps renders two. Callers pick the
  // right slot with `position` ('first' | 'last') to mirror the existing tests.
  static kbaQuestionCombobox(position = 'first') {
    return position === 'last'
      ? cy.findAllByRole('combobox').last()
      : cy.findAllByRole('combobox').first();
  }

  static kbaQuestionOption(name, position = 'first') {
    return position === 'last'
      ? cy.findAllByText(name).last()
      : cy.findAllByText(name).first();
  }

  static kbaAnswerInput(questionName, position = 'first') {
    return position === 'last'
      ? cy.findAllByLabelText(`Answer for: ${questionName}`).last()
      : cy.findAllByLabelText(`Answer for: ${questionName}`).first();
  }

  static get suspendMessage() {
    return cy.findByTestId('suspend-text-output');
  }

  static fill(user) {
    RegistrationJourneyPage.usernameInput.should('be.visible').type(user.username);
    RegistrationJourneyPage.firstNameInput.should('be.visible').type(user.firstName);
    RegistrationJourneyPage.lastNameInput.should('be.visible').type(user.lastName);
    RegistrationJourneyPage.emailInput.should('be.visible').type(user.emailAddress);
    RegistrationJourneyPage.passwordInput.should('be.visible').type(user.password);
  }

  static submit() {
    RegistrationJourneyPage.nextButton.click();
    cy.findByRole('status', { timeout: 10000 }).should('not.exist');
  }
}
