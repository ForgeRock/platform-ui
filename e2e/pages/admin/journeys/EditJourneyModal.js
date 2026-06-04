/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class EditJourneyModal {
  static get dialog() {
    return cy.findByRole('dialog', { name: 'Edit Journey' });
  }

  static get tagsInput() {
    return EditJourneyModal.dialog.findByRole('textbox', { name: 'Tags (optional)' });
  }

  static get tagRemoveIcons() {
    return EditJourneyModal.dialog.find('[data-testid^="multi-select-tag-close-icon-"]');
  }

  static tagOption(tagName) {
    return cy.findByRole('option', { name: new RegExp(tagName) });
  }

  static get saveButton() {
    return EditJourneyModal.dialog.findByRole('button', { name: 'Save' });
  }
}
