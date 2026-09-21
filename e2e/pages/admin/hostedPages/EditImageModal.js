/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * POM for the shared image-editing modal used by Hosted Pages (EditImageModal
 * component). Works for the Journey Pages logo, the Global favicon and both
 * Account Pages logo cards — only the dialog title differs per instance.
 */
export default class EditImageModal {
  static dialog(title) {
    return cy.findByRole('dialog', { name: title });
  }

  /**
   * The "Specify a Locale" button (only rendered while the image value is a
   * plain string, i.e. not yet localized).
   */
  static get specifyLocaleButton() {
    return cy.findByRole('button', { name: /specify a locale/i });
  }

  static get addLocaleDialog() {
    return cy.findByRole('dialog', { name: 'Add a Locale' });
  }

  static get localeInput() {
    return EditImageModal.addLocaleDialog.findByRole('textbox', { name: 'Locale' });
  }

  static get addLocaleButton() {
    return EditImageModal.addLocaleDialog.findByRole('button', { name: 'Add' });
  }

  /**
   * The FrLocaleDropdown trigger, which reads "Locale: <code>" once the image
   * value is localized. Pass a regex to match any currently selected locale.
   */
  static localeDropdownTrigger(locale) {
    return cy.contains('button', locale instanceof RegExp ? new RegExp(`Locale: ${locale.source}`) : `Locale: ${locale}`);
  }

  /**
   * A locale entry in the open locale dropdown (bootstrap-vue renders it in
   * the appended `.dropdown-menu.show`).
   */
  static localeOption(locale) {
    return cy.get('.dropdown-menu.show').contains('.dropdown-item', locale);
  }

  /**
   * The "Add Locale" option inside the open locale dropdown (only rendered
   * while the dropdown is expanded).
   */
  static get addLocaleOption() {
    return cy.get('[data-testid="add-locale-button"]');
  }

  static get logoUrlInput() {
    return cy.findByRole('textbox', { name: 'Logo URL' });
  }

  static get altTextInput() {
    return cy.findByRole('textbox', { name: 'Alt Text' });
  }

  static get updateButton() {
    return cy.findByRole('button', { name: 'Update' });
  }
}
