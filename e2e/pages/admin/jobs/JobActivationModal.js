/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class JobActivationModal {
  static get modal() {
    return cy.get('#job-activation-modal', { timeout: 10000 });
  }

  static get activateButton() {
    return JobActivationModal.modal.findByRole('button', { name: /^activate$/i });
  }

  static get deactivateButton() {
    return JobActivationModal.modal.findByRole('button', { name: /^deactivate$/i });
  }
}
