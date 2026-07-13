/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class ImportJourneyModal {
  // Both the Backup Trees step and the Upload File step share the title "Import Journeys"
  static get importJourneyDialog() {
    return cy.findByRole('dialog', { name: 'Import Journeys' });
  }

  // Backup Trees step buttons (disabled until precomputation completes — bump timeout)
  static get downloadBackupButton() {
    return ImportJourneyModal.importJourneyDialog.findByRole('button', { name: 'Download Backup', timeout: 20000 });
  }

  static get skipBackupButton() {
    return ImportJourneyModal.importJourneyDialog.findByRole('button', { name: 'Skip Backup', timeout: 20000 });
  }

  // Step 2: Skip Backup confirm — title is "Skip Backup?"
  static get skipBackupDialog() {
    return cy.findByRole('dialog', { name: 'Skip Backup?' });
  }

  static get skipBackupConfirmButton() {
    return ImportJourneyModal.skipBackupDialog.findByRole('button', { name: 'Skip Backup' });
  }

  // Collapsible "Show/Hide backup summary" toggle button
  static get showHideBackupSummaryButton() {
    return ImportJourneyModal.importJourneyDialog.findByRole('button', { name: /(Show|Hide) backup summary/i });
  }

  // The warning/info alert block on the Backup Trees step
  static get backupInfoText() {
    return ImportJourneyModal.importJourneyDialog.find('.alert-warning');
  }

  // Themes checkbox inside the Optional Dependencies section of the backup summary
  static get themesCheckbox() {
    return ImportJourneyModal.importJourneyDialog.findByRole('checkbox', { name: /Themes/i });
  }

  // The export-details collapse region (the summary body)
  static get backupSummaryCollapse() {
    return ImportJourneyModal.importJourneyDialog.find('#download-config-collapse');
  }

  // Upload File step elements
  static get fileInput() {
    return ImportJourneyModal.importJourneyDialog.find('input[type="file"]');
  }

  static get identityObjectSelect() {
    return ImportJourneyModal.importJourneyDialog.findByLabelText(/Identity Object/i);
  }

  static get overwriteAllRadio() {
    return ImportJourneyModal.importJourneyDialog.findByRole('radio', { name: /Overwrite all conflicts/i });
  }

  static get manuallyPickRadio() {
    return ImportJourneyModal.importJourneyDialog.findByRole('radio', { name: /Manually pick conflict resolution/i });
  }

  static get nextButton() {
    return ImportJourneyModal.importJourneyDialog.findByRole('button', { name: 'Next' });
  }

  static get invalidImportFileError() {
    return ImportJourneyModal.importJourneyDialog.findByText(/Invalid import file/i);
  }

  // Common footer buttons (apply at multiple steps)
  static get cancelButton() {
    return cy.findByRole('button', { name: 'Cancel' });
  }

  static get previousButton() {
    return cy.findByRole('button', { name: 'Previous' });
  }
}
