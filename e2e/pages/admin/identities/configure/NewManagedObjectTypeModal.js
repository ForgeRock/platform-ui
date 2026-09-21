/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/** Page object for the "New Managed Object Type" modal on the Identities > Configure list page. */
export default class NewManagedObjectTypeModal {
  /** The modal dialog itself, located by its title. */
  static get dialog() {
    return cy.findByRole('dialog', { name: 'New Managed Object Type' });
  }

  /** Toolbar button on the Configure list page that opens this modal. */
  static get addObjectTypeButton() {
    return cy.findByRole('button', { name: 'Managed Object Type' });
  }

  /** The "Object Type Key" input field. */
  static get objectTypeKeyInput() {
    return this.dialog.findByLabelText('Object Type Key');
  }

  /** The "Display Label" input field. */
  static get displayLabelInput() {
    return this.dialog.findByLabelText('Display Label');
  }

  /** The Save button in the modal footer. */
  static get saveButton() {
    return this.dialog.findByRole('button', { name: 'Save' });
  }

  /** The "Must be unique" validation error under the Object Type Key field. */
  static get uniqueError() {
    return this.dialog.findByText('Must be unique');
  }

  /**
   * Clears the key field, types an Object Type Key, and blurs to trigger validation.
   *
   * @param {string} value - Object Type Key to type.
   */
  static typeObjectTypeKey(value) {
    this.objectTypeKeyInput.clear().type(value).blur();
  }

  /**
   * Clears the Display Label field and types a new value.
   *
   * @param {string} value - Display Label to type.
   */
  static typeDisplayLabel(value) {
    this.displayLabelInput.clear().type(value);
  }

  /** Clicks the Save button in the modal footer. */
  static save() {
    this.saveButton.click();
  }
}
