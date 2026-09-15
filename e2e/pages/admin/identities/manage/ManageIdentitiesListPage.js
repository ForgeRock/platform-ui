/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

/** Page object for the Identities > Manage list page. */
export default class ManageIdentitiesListPage extends BaseAdminPage {
  /** "Manage Identities" heading — confirms the list page is loaded. */
  static get heading() {
    return cy.findByRole('heading', { name: 'Manage Identities' });
  }

  /** The identity list table rendered by ListResource (`id="list-resource-table"`). */
  static get listTable() {
    return cy.get('#list-resource-table');
  }

  /** The search box used to filter the identity list. */
  static get searchBox() {
    return cy.findByRole('searchbox', { name: 'Search' });
  }

  /** The loading spinner shown while the list data is fetching. */
  static get loadingSpinner() {
    return cy.get('[data-testid="loading-resources-spinner"]');
  }

  /**
   * A tab in the identity type tab bar (e.g. "Alpha realm - Users", "Users").
   *
   * @param {string} name - Full display name of the tab.
   * @param {Object} options - Optional Cypress query options (e.g. { timeout }).
   */
  static tab(name, options = {}) {
    return cy.findByRole('tab', { name, ...options });
  }

  /**
   * A cell in the identity list table matching the given identity name.
   * Clicking it opens the edit page for that identity.
   *
   * @param {string} name - Identity display name (e.g. userName value).
   */
  static identityCell(name) {
    return cy.findByRole('cell', { name });
  }

  /**
   * The "Delete {displayName}" confirm button inside the delete confirmation modal.
   *
   * @param {string} displayName - The translated identity type label shown in the modal title
   *   (e.g. "Alpha realm - User" on cloud, "User" on ForgeOps).
   */
  static confirmDeleteButton(displayName) {
    return cy.findByRole('dialog', { name: `Delete ${displayName}?` })
      .findByRole('button', { name: 'Delete' });
  }

  /** The "New {object}" toolbar button that opens the create-resource modal (e.g. "New Alpha realm - User"). */
  static get newUserButton() {
    return cy.findByRole('button', { name: /^New .*[Uu]ser$/ });
  }

  /**
   * The create-resource modal (title "New Alpha realm - user" on cloud, "New User" on ForgeOps).
   *
   * @param {Object} options - Optional Cypress query options (e.g. { timeout }).
   */
  static newUserDialog(options = {}) {
    return cy.findByRole('dialog', { name: /^New .*user$/i, ...options });
  }

  /**
   * An input in the create-resource modal addressed by its visible label.
   *
   * @param {string} label - e.g. 'Username', 'First Name', 'Last Name', 'Email Address', 'Password'.
   */
  static createUserField(label) {
    return ManageIdentitiesListPage.newUserDialog().findByLabelText(label);
  }

  /** The resize handle inside a column header of the identity list table.
   *
   * @param {number} columnIndex - Zero-based index of the header cell.
   */
  static resizer(columnIndex) {
    return cy.get('#list-resource-table thead th').eq(columnIndex).find('.resizer');
  }

  /**
   * A column header of the identity list table (name includes the sr-only sort suffix,
   * e.g. "Username (Click to sort ascending)").
   *
   * @param {number} columnIndex - Zero-based index of the header cell.
   */
  static columnHeader(columnIndex) {
    return cy.get('#list-resource-table thead th').eq(columnIndex);
  }

  /** The post-save success modal (title "User successfully created", sr-only but still labelled). */
  static get userCreatedDialog() {
    return cy.findByRole('dialog', { name: /successfully created/i });
  }

  /**
   * The "Customize Columns" button in the list card header.
   *
   * TODO: the button has no accessible name (IAM-12088 — Managed Identities and
   * Gov column picker buttons have no accessible name, so screen readers just
   * announce "button"). Replace this icon-glyph selector with a simple
   * `cy.findByRole('button', { name: 'Customize Columns' })` once the ticket
   * adds the accessible name. Until then, the FrIcon inside renders the icon
   * name ("view_column") as the span's text — the icon font replaces it
   * visually — so the button is identified by that glyph text; the "New …"
   * toolbar button carries a different icon.
   */
  static get customizeColumnsButton() {
    return cy.get('.card-header button').filter((_, el) => (
      Cypress.$(el).find('.material-icons-outlined, .material-icons')
        .filter((_idx, icon) => icon.textContent === 'view_column').length > 0
    ));
  }

  /** The "Customize Columns" modal rendered by FrColumnPicker. */
  static get customizeColumnsDialog() {
    return cy.findByRole('dialog', { name: 'Customize Columns' });
  }

  /** The "Customize Columns" modal's Apply button. */
  static get customizeColumnsApplyButton() {
    return ManageIdentitiesListPage.customizeColumnsDialog.findByRole('button', { name: 'Apply' });
  }

  /**
   * A "Remove {column} column" button inside the Customize Columns modal's active-columns list.
   *
   * @param {string} columnName - The visible column label (e.g. "Email Address").
   */
  static removeColumnButton(columnName) {
    return ManageIdentitiesListPage.customizeColumnsDialog
      .findByRole('button', { name: `Remove ${columnName} column` });
  }

  /** The sticky Actions column header — always the last column of the table. */
  static get actionsColumnHeader() {
    return cy.get('#list-resource-table thead th').last();
  }

  /**
   * The first unchecked available-column checkbox of the Customize Columns modal
   * (available columns are rendered as checkboxes, unchecked when not in the table).
   * The real input is visually hidden (opacity 0) behind the styled control.
   */
  static get uncheckedPickerCheckbox() {
    return ManageIdentitiesListPage.customizeColumnsDialog
      .find('input[type="checkbox"]:not(:checked)')
      .first();
  }

  /**
   * A column header of the identity list table addressed by its visible label
   * (header text carries the sr-only sort suffix, which is stripped for matching).
   *
   * @param {string} label - The visible column label (e.g. "Email Address").
   */
  static columnHeaderByLabel(label) {
    return cy.get('#list-resource-table thead th').filter((_, el) => {
      const text = el.innerText.trim().replace(/\s*\(Click to sort.*\)$/i, '');
      return text === label;
    });
  }

  /** The table's wrapping card (the horizontal scroll container of the list table). */
  static get tableScrollContainer() {
    return cy.get('#list-resource-table').parent();
  }

  /** The "Back to …" breadcrumb link in the navbar, shown on identity edit pages. */
  static get backToManagedIdentitiesLink() {
    return cy.findByRole('link', { name: /Back to .*/ });
  }
}
