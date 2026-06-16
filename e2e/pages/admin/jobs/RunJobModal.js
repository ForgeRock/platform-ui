/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class RunJobModal {
  static get modal() {
    return cy.get('#job-run-modal');
  }

  static get title() {
    return RunJobModal.modal.findByRole('heading', { name: /run scheduled job/i });
  }

  static get confirmationMessage() {
    return RunJobModal.modal.findByText(/are you sure you want to run this scheduled job now/i);
  }

  static get runJobButton() {
    return RunJobModal.modal.findByRole('button', { name: /run job/i });
  }

  static get cancelButton() {
    return RunJobModal.modal.findByRole('button', { name: /cancel/i });
  }
}
