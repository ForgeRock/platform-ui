/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class DeleteModal {
  static get modal() {
    return cy.get('#job-delete-modal', { timeout: 10000 });
  }

  static get title() {
    return DeleteModal.modal.find('.modal-title');
  }

  static get message() {
    return DeleteModal.modal.find('[data-testid="delete-modal-custom-message"]');
  }

  static get cancelButton() {
    return DeleteModal.modal.findByRole('button', { name: /^cancel$/i });
  }

  static get deleteButton() {
    return DeleteModal.modal.findByRole('button', { name: /^delete$/i });
  }
}
