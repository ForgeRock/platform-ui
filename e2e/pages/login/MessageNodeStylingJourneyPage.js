/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class MessageNodeStylingJourneyPage {
  static get callbacksPanel() {
    return cy.get('#callbacksPanel', { timeout: 10000 });
  }

  static get nextButton() {
    return this.callbacksPanel.findByRole('button', { name: 'Next' });
  }

  static get userNameInput() {
    return cy.findByLabelText('User Name', { timeout: 20000 });
  }

  static get appFooter() {
    return cy.get('#appFooter', { timeout: 10000 });
  }

  static get primaryButton() {
    return this.callbacksPanel.find('.btn-primary');
  }

  static get failureAlert() {
    return this.callbacksPanel.find('#loginFailureAlert');
  }

  static actionButton(name) {
    return this.callbacksPanel.findByRole('button', { name, timeout: 10000 });
  }

  static actionButtons() {
    return this.callbacksPanel.findAllByRole('button');
  }
}
