/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

/**
 * Page object for the Accounts table on the managed user edit view
 * (Identities > Manage > Users > [user] > Applications tab).
 */
export default class ApplicationAccountsPage extends BaseAdminPage {
  /** "Account Type" column header in the Accounts table. */
  static get accountTypeColumnHeader() {
    return cy.findByRole('columnheader', { name: 'Account Type' });
  }

  /** "Assignment" column header in the Accounts table. */
  static get assignmentColumnHeader() {
    return cy.findByRole('columnheader', { name: 'Assignment' });
  }

  /** All column headers of the Accounts table. */
  static get accountTableColumnHeaders() {
    return cy.findByRole('table').findAllByRole('columnheader');
  }

  /** A row in the Accounts table by application name. */
  static accountRow(appName) {
    return cy.findByRole('table').findByRole('row', { name: new RegExp(appName) });
  }

  /** "Direct" badge cell in an account row. */
  static accountRowDirectBadge(appName) {
    return ApplicationAccountsPage.accountRow(appName).findByText('Direct');
  }

  /** All rows in the Accounts table for an application. */
  static accountRows(appName) {
    return cy.findByRole('table').findAllByRole('row', { name: new RegExp(appName) });
  }

  /**
   * "Direct" badge cell in one Accounts-table row, by index. Re-resolves the DOM per
   * call so assertions survive the table re-render that follows each grant.
   */
  static accountRowDirectBadgeByIndex(appName, index) {
    return cy.findByRole('table')
      .findAllByRole('row', { name: new RegExp(appName) })
      .eq(index)
      .findByText('Direct');
  }

  /** The "Assign Application" modal. */
  static get assignApplicationDialog() {
    return cy.findByRole('dialog', { name: 'Assign Application' });
  }

  /** Applications combobox on the modal's picker step. */
  static get applicationsCombobox() {
    return ApplicationAccountsPage.assignApplicationDialog.findByRole('combobox', { name: 'Applications' });
  }

  /** An application option in the combobox dropdown. */
  static applicationOption(appName) {
    return cy.findByRole('option', { name: new RegExp(appName, 'i') });
  }

  /**
   * Account Type select on the modal's account-details step. .last() targets the
   * visible input: some multiselect builds render a hidden internal one first.
   */
  static get accountTypeInput() {
    return ApplicationAccountsPage.assignApplicationDialog.findAllByLabelText('Account Type').last();
  }

  /** "City" input on the account-details step (RegExp: optional labels gain "(optional)"). */
  static get cityInput() {
    return ApplicationAccountsPage.assignApplicationDialog.findByLabelText(/^City/);
  }

  /** An Account Type option in the multiselect dropdown. */
  static accountTypeOption(label) {
    return cy.findByRole('option', { name: new RegExp(`^${label}$`, 'i') });
  }

  /**
   * Multiselect input for a non-account-object (NAO) field (e.g. ProfileId). The
   * fields render only after the target preview resolves, hence the timeout.
   */
  static naoSelect(naoName) {
    return ApplicationAccountsPage.assignApplicationDialog.findByRole('combobox', { name: new RegExp(naoName, 'i'), timeout: 15000 });
  }

  /** Assign button inside the Assign Application modal. */
  static get assignButton() {
    return ApplicationAccountsPage.assignApplicationDialog.findByRole('button', { name: 'Assign' });
  }

  /** Next button inside the Assign Application modal (picker step, provisioning app). */
  static get nextButton() {
    return ApplicationAccountsPage.assignApplicationDialog.findByRole('button', { name: 'Next' });
  }

  /** Save button inside the Assign Application modal (edit mode). */
  static get saveButton() {
    return ApplicationAccountsPage.assignApplicationDialog.findByRole('button', { name: 'Save' });
  }
}
