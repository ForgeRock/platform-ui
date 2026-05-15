/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class EditPersonalInfoModal {
  static get modal() {
    return cy.findByRole('dialog', { name: /edit personal info/i });
  }

  static get firstNameInput() {
    return EditPersonalInfoModal.modal.findByLabelText(/^first name$/i);
  }

  static get lastNameInput() {
    return EditPersonalInfoModal.modal.findByLabelText(/^last name$/i);
  }

  static get descriptionInput() {
    return EditPersonalInfoModal.modal.findByLabelText(/description/i);
  }

  static get saveButton() {
    return EditPersonalInfoModal.modal.findByRole('button', { name: 'Save' });
  }

  static get cancelButton() {
    return EditPersonalInfoModal.modal.findByRole('button', { name: /^cancel$/i });
  }
}
