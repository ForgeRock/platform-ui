/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class CspDeleteDirectiveModal {
  static get modal() {
    return cy.findByRole('dialog', { name: /delete directive/i });
  }

  static get deleteButton() {
    return CspDeleteDirectiveModal.modal.findByRole('button', { name: /delete/i });
  }

  static get cancelButton() {
    return CspDeleteDirectiveModal.modal.findByRole('button', { name: /cancel/i });
  }

  static get closeButton() {
    return CspDeleteDirectiveModal.modal.findByRole('button', { name: /close/i });
  }
}
