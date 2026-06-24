/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class AddJourneyModal {
  static get pickerDialog() {
    return cy.findByRole('dialog', { name: 'Add Journey' });
  }

  static get fromScratchRadio() {
    return AddJourneyModal.pickerDialog.findByRole('radio', { name: /Start from scratch/i });
  }

  static get importRadio() {
    return AddJourneyModal.pickerDialog.findByRole('radio', { name: /Import/i });
  }

  static get pickerNextButton() {
    return AddJourneyModal.pickerDialog.findByRole('button', { name: 'Next' });
  }

  static get createDialog() {
    return cy.findByRole('dialog', { name: 'New Journey' });
  }

  static get nameInput() {
    return AddJourneyModal.createDialog.findByRole('textbox', { name: 'Name' });
  }

  static get identityObjectCombobox() {
    return AddJourneyModal.createDialog.findByRole('combobox', { name: 'Identity Object' });
  }

  static get descriptionInput() {
    return AddJourneyModal.createDialog.findByRole('textbox', { name: 'Description (optional)' });
  }

  static get tagsInput() {
    return AddJourneyModal.createDialog.findByRole('textbox', { name: 'Tags (optional)' });
  }

  static tagOption(tagName) {
    return cy.findByRole('option', { name: new RegExp(tagName) });
  }

  static get saveButton() {
    return AddJourneyModal.createDialog.findByRole('button', { name: 'Save' });
  }

  static get cancelButton() {
    return AddJourneyModal.createDialog.findByRole('button', { name: 'Cancel' });
  }
}
