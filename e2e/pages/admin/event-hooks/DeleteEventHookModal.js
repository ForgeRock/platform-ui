/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class DeleteEventHookModal {
  static get modal() {
    return cy.findByRole('dialog', { name: /delete event hook/i });
  }

  static get cancelButton() {
    return DeleteEventHookModal.modal.findByRole('button', { name: 'Cancel' });
  }

  static get deleteButton() {
    return DeleteEventHookModal.modal.findByRole('button', { name: 'Delete' });
  }
}
