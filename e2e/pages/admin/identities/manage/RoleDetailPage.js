/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

/** Page object for the managed Role detail/edit page (Identities > Manage > Roles > [role]). */
export default class RoleDetailPage extends BaseAdminPage {
  /** Page heading showing the role name. */
  static roleHeading(roleName) {
    return cy.findByRole('heading', { name: roleName, timeout: 15000 });
  }

  /** Sub-heading showing the identity type — "Alpha realm - Role" on cloud, "Role" on ForgeOps. */
  static identityTypeHeading(displayName) {
    return cy.findByRole('heading', { name: displayName, timeout: 15000 });
  }

  /** "Back to ... Role List" link in the page header. */
  static get backToRoleListLink() {
    return cy.findByRole('link', { name: /^Back to .*Role List$/ });
  }

  /** Name field on the Details tab of the role detail page. */
  static get nameInput() {
    return cy.findByRole('textbox', { name: 'Name' });
  }

  /** Description field on the Details tab of the role detail page. */
  static get descriptionInput() {
    return cy.findByRole('textbox', { name: 'Description' });
  }

  /** "Details" tab — open by default. */
  static get detailsTab() {
    return cy.findByRole('tab', { name: 'Details' });
  }

  /** "Settings" tab — contains the Condition and Temporal Constraints rows. */
  static get settingsTab() {
    return cy.findByRole('tab', { name: 'Settings' });
  }

  /** All tabs on the role detail page — used to assert the full tab set is present. */
  static get allTabs() {
    return cy.findAllByRole('tab');
  }

  /**
   * Row-level button in the "Temporal Constraints" row on the Settings tab.
   * Reads "Set Up" before a constraint is saved and "Edit" after — assert on the label to
   * catch past regressions where it didn't update.
   */
  static get temporalConstraintsSetupButton() {
    return cy.contains('td', /^Temporal Constraints/)
      .parents('tr')
      .findByRole('button');
  }

  /** Cell containing "Temporal Constraints" label on the Settings tab. */
  static get temporalConstraintsCell() {
    return cy.contains('td', /^Temporal Constraints/);
  }

  /** Cell containing "Condition" label on the Settings tab. */
  static get conditionsCell() {
    return cy.contains('td', /^Condition\b/);
  }

  /** Row-level button in the "Condition" row on the Settings tab (reads "Set up" before configured). */
  static get conditionsSetupButton() {
    return cy.contains('td', /^Condition\b/)
      .parents('tr')
      .findByRole('button');
  }

  /** "Temporal Constraints" dialog opened from the Settings tab. */
  static get temporalConstraintsDialog() {
    return cy.findByRole('dialog', { name: 'Temporal Constraints' });
  }

  /** Cancel button inside the Temporal Constraints dialog. */
  static get temporalConstraintsDialogCancelButton() {
    return RoleDetailPage.temporalConstraintsDialog.findByRole('button', { name: 'Cancel' });
  }

  /** Save button inside the Temporal Constraints dialog. */
  static get temporalConstraintsDialogSaveButton() {
    return RoleDetailPage.temporalConstraintsDialog.findByRole('button', { name: 'Save' });
  }

  /** Toggle switch inside the Temporal Constraints dialog. */
  static get temporalConstraintsSwitch() {
    return cy.findByRole('switch', { name: 'An array of temporal constraints for a role' });
  }

  /**
   * "Start" label above the start-date picker inside the Temporal Constraints dialog.
   * The BootstrapVue datepicker only exposes its inner ARIA text via aria-labelledby → value,
   * so we anchor on the visible field label instead of the ambiguous role="group".
   */
  static get temporalConstraintsStartLabel() {
    return RoleDetailPage.temporalConstraintsDialog.contains('label', /^Start$/);
  }

  /** "End" label above the end-date picker inside the Temporal Constraints dialog. */
  static get temporalConstraintsEndLabel() {
    return RoleDetailPage.temporalConstraintsDialog.contains('label', /^End$/);
  }

  /**
   * BootstrapVue datepickers inside the Temporal Constraints dialog.
   * `.eq(0)` is the Start date, `.eq(1)` is the End date — assert against
   * their label text to detect a value change.
   */
  static get temporalConstraintsDatePickerLabels() {
    return cy.get('.b-form-datepicker label');
  }

  /** Time Zone Offset range slider inside the Temporal Constraints dialog. */
  static get temporalConstraintsTimeZoneOffsetInput() {
    return RoleDetailPage.temporalConstraintsDialog.findByLabelText('Time Zone Offset');
  }

  /** "Role Members" tab on the role detail page. */
  static get roleMembersTab() {
    return cy.findByRole('tab', { name: 'Role Members' });
  }

  /** "Add Role Members" button on the Role Members tab. */
  static get addRoleMembersButton() {
    return cy.findByRole('button', { name: 'Add Role Members' });
  }

  /** The "Add Role Members" modal. */
  static get addRoleMembersDialog() {
    return cy.findByRole('dialog', { name: 'Add Role Members' });
  }

  /** Combobox inside the Add Role Members modal. */
  static get roleMembersCombobox() {
    return RoleDetailPage.addRoleMembersDialog.findByRole('combobox', { name: 'Role Members' });
  }

  /** A user option in the combobox dropdown (by username). */
  static roleMemberOption(username) {
    return cy.findByRole('option', { name: new RegExp(username, 'i') });
  }

  /** Save button inside the Add Role Members modal. */
  static get addRoleMembersSaveButton() {
    return RoleDetailPage.addRoleMembersDialog.findByRole('button', { name: 'Save' });
  }

  /** A row in the Role Members grid by username. */
  static roleMemberRow(username) {
    return cy.findByRole('grid').findByRole('row', { name: new RegExp(username) });
  }

  // -------- Applications tab --------

  /** "Applications" tab on the role detail page. */
  static get applicationsTab() {
    return cy.findByRole('tab', { name: 'Applications' });
  }

  /** "Add Application" button on the Applications tab. */
  static get addApplicationButton() {
    return cy.findByRole('button', { name: 'Add Application' });
  }

  /** The "Assign Application" modal. */
  static get assignApplicationDialog() {
    return cy.findByRole('dialog', { name: 'Assign Application' });
  }

  /** Applications combobox inside the Assign Application modal. */
  static get applicationsCombobox() {
    return RoleDetailPage.assignApplicationDialog.findByRole('combobox', { name: 'Applications' });
  }

  /** An application option in the combobox dropdown (by name). */
  static applicationOption(appName) {
    return cy.findByRole('option', { name: new RegExp(appName, 'i') });
  }

  /** Assign button inside the Assign Application modal. */
  static get assignApplicationAssignButton() {
    return RoleDetailPage.assignApplicationDialog.findByRole('button', { name: 'Assign' });
  }

  /** Next button inside the Assign Application modal (disabled until an application is picked). */
  static get assignApplicationNextButton() {
    return RoleDetailPage.assignApplicationDialog.findByRole('button', { name: 'Next' });
  }

  /** Cancel button inside the Assign Application modal. */
  static get assignApplicationCancelButton() {
    return RoleDetailPage.assignApplicationDialog.findByRole('button', { name: 'Cancel' });
  }

  /** A row in the Applications table by application name. */
  static applicationRow(appName) {
    return cy.findByRole('table').findByRole('row', { name: new RegExp(appName) });
  }

  /** "There are no records to show" empty row in the Applications table. */
  static get applicationsEmptyState() {
    return cy.findByRole('row', { name: 'There are no records to show' });
  }

  /** "Confirm Removal" dialog shown after clicking Revoke. */
  static get confirmRemovalDialog() {
    return cy.findByRole('dialog', { name: 'Confirm Removal' });
  }

  /** Remove button inside the Confirm Removal dialog. */
  static get confirmRemovalButton() {
    return RoleDetailPage.confirmRemovalDialog.findByRole('button', { name: 'Remove' });
  }

  // -------- Delete role --------

  /** Confirmation dialog shown after clicking Delete on the role detail page. */
  static get deleteRoleDialog() {
    return cy.findByRole('dialog', { name: /Delete .*Role\?/i });
  }

  /** Delete confirm button inside the delete dialog. */
  static get deleteRoleConfirmButton() {
    return RoleDetailPage.deleteRoleDialog.findByRole('button', { name: 'Delete' });
  }

  /**
   * Delete button on the role detail page — label includes the identity display name
   * ("Delete Alpha realm - Role" on cloud, "Delete Role" on ForgeOps).
   */
  static deleteRoleButton(displayName) {
    return cy.findByRole('button', { name: `Delete ${displayName}` });
  }
}
