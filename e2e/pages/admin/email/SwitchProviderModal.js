/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class SwitchProviderModal {
  static get modal() {
    return cy.findByRole('dialog', { name: 'Use Built-in Email Provider?' });
  }

  static get confirmButton() {
    return SwitchProviderModal.modal.findByRole('button', { name: 'Confirm' });
  }

  static get cancelButton() {
    return SwitchProviderModal.modal.findByRole('button', { name: 'Cancel' });
  }
}
