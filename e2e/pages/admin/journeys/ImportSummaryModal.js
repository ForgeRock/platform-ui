/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class ImportSummaryModal {
  static get dialog() {
    return cy.findByRole('dialog', { name: 'Import Summary' });
  }

  static get startImportButton() {
    return ImportSummaryModal.dialog.findByRole('button', { name: 'Start Import' });
  }

  static get cancelButton() {
    return ImportSummaryModal.dialog.findByRole('button', { name: 'Cancel' });
  }

  static get previousButton() {
    return ImportSummaryModal.dialog.findByRole('button', { name: 'Previous' });
  }

  static section(name) {
    return ImportSummaryModal.dialog.contains(name);
  }
}
