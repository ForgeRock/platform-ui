/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class CreateSecurityHeaderModal {
  static get modal() {
    return cy.findByRole('dialog', { name: 'Create Security Header' });
  }

  static get headerNameInput() {
    return CreateSecurityHeaderModal.modal.findByLabelText('Header Name');
  }

  static get headerValueInput() {
    return CreateSecurityHeaderModal.modal.findByLabelText('Value');
  }

  static get saveButton() {
    return CreateSecurityHeaderModal.modal.findByRole('button', { name: 'Save' });
  }
}
