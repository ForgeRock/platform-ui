/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class NoJourneysToImportModal {
  static get dialog() {
    return cy.findByRole('dialog', { name: 'No Journeys to Import' });
  }

  static get heading() {
    return NoJourneysToImportModal.dialog.findByText(/You haven't selected any journeys to import/i);
  }

  static get doneButton() {
    return NoJourneysToImportModal.dialog.findByRole('button', { name: 'Done' });
  }

  static get previousButton() {
    return NoJourneysToImportModal.dialog.findByRole('button', { name: 'Previous' });
  }
}
