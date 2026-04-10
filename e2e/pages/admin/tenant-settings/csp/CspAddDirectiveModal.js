/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default class CspAddDirectiveModal {
  // ── Shared ────────────────────────────────────────────────────────────────────

  static get modal() {
    return cy.findByRole('dialog');
  }

  static get cancelButton() {
    return CspAddDirectiveModal.modal.findByRole('button', { name: 'Cancel' });
  }

  static get closeButton() {
    return CspAddDirectiveModal.modal.findByRole('button', { name: 'Close' });
  }

  static get heading() {
    return CspAddDirectiveModal.modal.findByRole('heading', { name: /add directive/i });
  }

  static get directiveCombobox() {
    return CspAddDirectiveModal.modal.findByRole('combobox', { name: /select a directive/i });
  }

  static directiveOption(directiveName) {
    return CspAddDirectiveModal.modal.findByRole('option', { name: directiveName });
  }

  static get nextButton() {
    return CspAddDirectiveModal.modal.findByRole('button', { name: 'Next' });
  }

  static selectedDirectiveHeading(directiveName) {
    return CspAddDirectiveModal.modal.findByRole('heading', { name: directiveName });
  }

  static sourceCheckbox(sourceName) {
    return CspAddDirectiveModal.modal.findByRole('checkbox', { name: sourceName });
  }

  static get hostsInput() {
    return CspAddDirectiveModal.modal.findByRole('textbox', { name: /hosts/i });
  }

  static get reportingEndpointInput() {
    return CspAddDirectiveModal.modal.findByRole('textbox', { name: /reporting endpoint/i });
  }

  static get reportingGroupInput() {
    return CspAddDirectiveModal.modal.findByRole('textbox', { name: /reporting group/i });
  }

  static get pluginTypesInput() {
    return CspAddDirectiveModal.modal.findByRole('textbox', { name: /plugin types/i });
  }

  static get saveButton() {
    return CspAddDirectiveModal.modal.findByRole('button', { name: 'Save' });
  }

  static get previousButton() {
    return CspAddDirectiveModal.modal.findByRole('button', { name: 'Previous' });
  }
}
