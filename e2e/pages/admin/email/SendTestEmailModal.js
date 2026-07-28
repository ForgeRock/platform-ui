/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class SendTestEmailModal {
  static get modal() {
    return cy.findByRole('dialog', { name: 'Send test email' });
  }

  static get emailAddressInput() {
    return SendTestEmailModal.modal.findByLabelText('To');
  }

  static get sendButton() {
    return SendTestEmailModal.modal.findByRole('button', { name: 'Send' });
  }
}
