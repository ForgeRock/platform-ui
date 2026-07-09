/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class MessageContentModal {
  static get dialog() {
    return cy.findByRole('dialog', { name: 'Message' });
  }

  static get keyInput() {
    return MessageContentModal.dialog.findByLabelText('Key');
  }

  static get valueInput() {
    return MessageContentModal.dialog.findByLabelText('Value');
  }

  static get doneButton() {
    return MessageContentModal.dialog.findByRole('button', { name: 'Done' });
  }

  static get saveButton() {
    return MessageContentModal.dialog.findByRole('button', { name: 'Save' });
  }
}
