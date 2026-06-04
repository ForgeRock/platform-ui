/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class DuplicateJourneyModal {
  static get dialog() {
    return cy.findByRole('dialog', { name: 'Duplicate Journey' });
  }

  static get nameInput() {
    return DuplicateJourneyModal.dialog.findByRole('textbox', { name: 'Name' });
  }

  static get tagsInput() {
    return DuplicateJourneyModal.dialog.findByRole('textbox', { name: 'Tags (optional)' });
  }

  static tagOption(tagName) {
    return cy.findByRole('option', { name: new RegExp(tagName) });
  }

  static get tagRemoveIcons() {
    return DuplicateJourneyModal.dialog.find('[data-testid^="multi-select-tag-close-icon-"]');
  }

  static get saveButton() {
    return DuplicateJourneyModal.dialog.findByRole('button', { name: 'Save' });
  }

  static get cancelButton() {
    return DuplicateJourneyModal.dialog.findByRole('button', { name: 'Cancel' });
  }
}
