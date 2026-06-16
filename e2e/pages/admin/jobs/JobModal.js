/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class JobModal {
  static get modal() {
    return cy.findByRole('dialog', { name: /(schedule a job|job details|choose entity)/i });
  }

  // ── Step 0: Choose Job Type ───────────────────────────────────────────────────

  static get scriptTypeOption() {
    return JobModal.modal.findByRole('radio', { name: /^script/i });
  }

  static get taskScannerTypeOption() {
    return JobModal.modal.findByRole('radio', { name: /task scanner/i });
  }

  // ── Step 1: Choose Entity to Scan (Task Scanner only) ─────────────────────────

  static get entityCombobox() {
    return JobModal.modal.findByRole('combobox', { name: /entity to scan/i });
  }

  static entityOption(name) {
    return JobModal.modal.findByRole('option', { name: new RegExp(name, 'i') });
  }

  // ── Step 2: Job Details ────────────────────────────────────────────────────────

  static get jobNameInput() {
    return JobModal.modal.findByLabelText(/job name/i);
  }

  static get jobNameValidationError() {
    return JobModal.jobNameInput.closest('.form-label-group').parent().findByRole('alert');
  }

  static get frequencyRunEveryInput() {
    return JobModal.modal.get('[data-testid="fr-field-runInterval"] input');
  }

  static get frequencyRunEveryValidationError() {
    return JobModal.modal.get('[data-testid="fr-field-runInterval"] [role="alert"]');
  }

  static get frequencyRepeatCountInput() {
    return JobModal.modal.get('[data-testid="fr-field-repeatCount"] input');
  }

  static get frequencyRepeatCountValidationError() {
    return JobModal.modal.get('[data-testid="fr-field-repeatCount"] [role="alert"]');
  }

  static get frequencyTimeIntervalCombobox() {
    return JobModal.modal.get('[data-testid="fr-field-timeIntervalSelect"] .multiselect');
  }

  static frequencyTimeIntervalOption(unitLabel) {
    return JobModal.modal.contains('.multiselect__option', unitLabel);
  }

  static get scriptSection() {
    return JobModal.modal.get('[data-testid="script"]');
  }

  static get scriptEditorInput() {
    return JobModal.modal.get('[data-testid="script"] .prism-editor__textarea');
  }

  // ── Step 2: Task Scanner Job Details ──────────────────────────────────────────

  static get editEntityButton() {
    return JobModal.modal.findByRole('button', { name: /^edit$/i });
  }

  static get taskStateStartedInput() {
    return JobModal.modal.get('[data-testid="fr-field-Started"] input');
  }

  static get taskStateStartedValidationError() {
    return JobModal.modal.get('[data-testid="fr-field-Started"] [role="alert"]');
  }

  static get taskStateCompletedInput() {
    return JobModal.modal.get('[data-testid="fr-field-Completed"] input');
  }

  static get taskStateCompletedValidationError() {
    return JobModal.modal.get('[data-testid="fr-field-Completed"] [role="alert"]');
  }

  // ── Filter / Query (Task Scanner) ─────────────────────────────────────────────

  static get queryFilterPropertyCombobox() {
    return JobModal.modal.get('[data-testid*="selectPropOptions"]');
  }

  static queryFilterPropertyOption(name) {
    return JobModal.modal.findByRole('option', { name: new RegExp(name, 'i') });
  }

  static get queryFilterValueInput() {
    return JobModal.modal.get('[data-testid*="inputValue"] input');
  }

  // ── Footer Buttons ────────────────────────────────────────────────────────────

  static get nextButton() {
    return JobModal.modal.findByRole('button', { name: /next/i });
  }

  static get saveButton() {
    return JobModal.modal.findByRole('button', { name: /save/i });
  }
}
