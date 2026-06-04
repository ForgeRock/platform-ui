/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class DeleteJourneyModal {
  static get dialog() {
    return cy.findByRole('dialog', { name: 'Delete Journey?' });
  }

  static get deleteButton() {
    return DeleteJourneyModal.dialog.findByRole('button', { name: 'Delete' });
  }

  static get cancelButton() {
    return DeleteJourneyModal.dialog.findByRole('button', { name: 'Cancel' });
  }
}
