/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class ImportCompleteModal {
  static get dialog() {
    return cy.findByRole('dialog', { name: 'Import Complete' });
  }

  static get doneButton() {
    return ImportCompleteModal.dialog.findByRole('button', { name: 'Done' });
  }

  static importedCount() {
    return ImportCompleteModal.dialog.findByText(/Imported \d+ journey/i);
  }
}
