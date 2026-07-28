/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class EmailProviderPage {
  static get heading() {
    return cy.contains('h1', 'Email Provider');
  }

  static get builtinCard() {
    return cy.findByText('Built-in SMTP server');
  }

  static get addCustomProviderButton() {
    return cy.findByRole('button', { name: 'Custom Provider' });
  }

  static get switchToBuiltinButton() {
    return cy.findByRole('button', { name: 'Switch to Built-in Provider' });
  }

  static get sendTestEmailButton() {
    return cy.findByRole('button', { name: 'Send Test Email' });
  }

  static get editButton() {
    return cy.findByRole('button', { name: 'Edit' });
  }

  static providerTitle(name) {
    return cy.findByText(name);
  }
}
