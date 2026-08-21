/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

/** Page object for the managed Assignment detail/edit page (Identities > Manage > Assignments > [assignment]). */
export default class AssignmentDetailPage extends BaseAdminPage {
  /** Page heading showing the assignment name. */
  static assignmentHeading(name) {
    return cy.findByRole('heading', { name, timeout: 15000 });
  }

  /** Sub-heading showing the identity type — "Alpha realm - Assignment" on cloud, "Assignment" on ForgeOps. */
  static identityTypeHeading(displayName) {
    return cy.findByRole('heading', { name: displayName, timeout: 15000 });
  }

  /** All tabs on the assignment detail page — used to assert the full tab set is present. */
  static get allTabs() {
    return cy.findAllByRole('tab');
  }

  /** "Details" tab — open by default. */
  static get detailsTab() {
    return cy.findByRole('tab', { name: 'Details' });
  }

  /** "Assignment Members" tab on the assignment detail page. */
  static get membersTab() {
    return cy.findByRole('tab', { name: 'Assignment Members' });
  }

  /** "Managed Roles" tab on the assignment detail page. */
  static get managedRolesTab() {
    return cy.findByRole('tab', { name: 'Managed Roles' });
  }

  // -------- Details tab: Name / Description --------
  // Note: The Assignment details form binds :label to the raw property key
  // (see Assignment/Edit/index.vue), so labels are lowercase — 'name', 'description', 'type'.

  /** Name field on the Details tab. */
  static get nameInput() {
    return cy.findByRole('textbox', { name: 'name' });
  }

  /** Description field on the Details tab. */
  static get descriptionInput() {
    return cy.findByRole('textbox', { name: 'description' });
  }

  /** Type field on the Details tab. */
  static get typeInput() {
    return cy.findByRole('textbox', { name: 'type' });
  }

  /** Save button inside the Assignment Details card — disabled when no changes have been made. */
  static get saveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }

  /** "Mapping" section heading on the Details tab. */
  static get mappingHeading() {
    return cy.findByRole('heading', { name: 'Mapping' });
  }

  // -------- Details tab: Assignment Attributes card --------

  /** "Assignment Attributes" card container. */
  static get assignmentAttributesCard() {
    return cy.get('.card-header').contains('Assignment Attributes').parents('.card');
  }

  /** "Add an attribute" button inside the Assignment Attributes card. */
  static get addAttributeButton() {
    return cy.findByRole('button', { name: 'Add an attribute' });
  }

  /** "Target system attribute" combobox shown in the card footer after clicking Add an attribute. */
  static get targetAttributeCombobox() {
    return AssignmentDetailPage.assignmentAttributesCard
      .find('.card-footer')
      .findByRole('combobox', { name: 'Target system attribute' });
  }

  /** A cell in the Assignment Attributes table matching the given attribute name. */
  static attributeCell(attributeName) {
    return AssignmentDetailPage.assignmentAttributesCard
      .findByRole('cell', { name: new RegExp(attributeName) });
  }

  // -------- Details tab: Event Scripts card --------

  /** "Event Scripts" card container. */
  static get eventScriptsCard() {
    return cy.get('.card-header').contains('Event Scripts').parents('.card');
  }

  /** "Add an event script" button inside the Event Scripts card. */
  static get addEventScriptButton() {
    return cy.findByRole('button', { name: 'Add an event script' });
  }

  /** Row/cell within the Event Scripts table for a given event name (e.g. 'onAssignment'). */
  static eventScriptCell(eventName) {
    return AssignmentDetailPage.eventScriptsCard.findByRole('cell', { name: eventName });
  }

  /**
   * "Add Event Script" dialog. Its title changes based on state:
   * - 0 events saved → "Add Event Script"
   * - 1 event saved → "Add onAssignment Script" or "Add onUnassignment Script"
   *   (the app pre-selects the remaining event, so the title reflects that choice).
   */
  static get addEventScriptDialog() {
    return cy.findByRole('dialog', { name: /^Add .*Script$/ });
  }

  /** Event combobox inside the Add Event Script dialog (only present when 0 events exist). */
  static get eventCombobox() {
    return AssignmentDetailPage.addEventScriptDialog.findByRole('combobox', { name: 'Event' });
  }

  /** Save button inside the Add Event Script dialog. */
  static get addEventScriptSaveButton() {
    return AssignmentDetailPage.addEventScriptDialog.findByRole('button', { name: 'Save' });
  }

  /** Script editor textarea inside the Add Event Script dialog (the editable element in VuePrism). */
  static get scriptEditorArea() {
    return AssignmentDetailPage.addEventScriptDialog
      .find('.fr-script-editor:not(.fr-script-editor-vars) .prism-editor__textarea');
  }

  /** File upload area shown inside the Add Event Script dialog when Upload File is toggled on. */
  static get uploadFileArea() {
    return AssignmentDetailPage.addEventScriptDialog.find('.custom-file');
  }

  /** "Upload File" toggle inside the Add Event Script dialog. */
  static get uploadFileToggle() {
    return AssignmentDetailPage.addEventScriptDialog.findByRole('switch', { name: 'Upload File' });
  }

  /** File path input shown when Upload File is toggled on. */
  static get uploadFileInput() {
    return AssignmentDetailPage.addEventScriptDialog.findByLabelText('Upload File');
  }

  /** "Variables" button inside the Add Event Script dialog (shown when no variables exist yet). */
  static get variablesButton() {
    return AssignmentDetailPage.addEventScriptDialog.findByRole('button', { name: /variables/i });
  }

  /** "Passed Variables" heading inside the Add Event Script dialog. */
  static get passedVariablesHeading() {
    return AssignmentDetailPage.addEventScriptDialog.findByText('Passed Variables');
  }

  /** JSON toggle inside the Variables section of the Add Event Script dialog. */
  static get variablesJsonToggle() {
    return AssignmentDetailPage.addEventScriptDialog.findByRole('switch', { name: /^json$/i });
  }

  /** JSON code editor inside the Variables section (second prism editor in the dialog). */
  static get variablesJsonEditor() {
    return AssignmentDetailPage.addEventScriptDialog
      .findAllByLabelText('Press ESC followed by tab for keyboard navigation out of editor')
      .last();
  }

  /** Name input for the first variable row inside the Variables section. */
  static get variableNameInput() {
    return AssignmentDetailPage.addEventScriptDialog
      .find('.fr-script-editor-vars input.form-control-sm')
      .first();
  }

  /** Value input for the first variable row inside the Variables section. */
  static get variableValueInput() {
    return AssignmentDetailPage.addEventScriptDialog
      .find('.fr-script-editor-vars input.form-control-sm')
      .last();
  }

  /** Add variable row button inside the Variables section. */
  static get addVariableRowButton() {
    return AssignmentDetailPage.addEventScriptDialog
      .find('.fr-script-editor-vars .max-height-50')
      .last();
  }

  // -------- Assignment Members tab --------

  /** "Add Assignment Members" button on the Assignment Members tab. */
  static get addMembersButton() {
    return cy.findByRole('button', { name: /^Add Assignment Members$/i });
  }

  /** "Add Assignment Members" modal. */
  static get addMembersDialog() {
    return cy.findByRole('dialog', { name: /^Add Assignment Members$/i });
  }

  /** Combobox inside the Add Assignment Members modal. */
  static get membersCombobox() {
    return AssignmentDetailPage.addMembersDialog.findByRole('combobox', { name: /Assignment Members/i });
  }

  /** A user option in the members combobox dropdown (by username). */
  static memberOption(username) {
    return cy.findByRole('option', { name: new RegExp(username, 'i') });
  }

  /** Save button inside the Add Assignment Members modal. */
  static get addMembersSaveButton() {
    return AssignmentDetailPage.addMembersDialog.findByRole('button', { name: 'Save' });
  }

  /** A row in the Assignment Members grid by username. */
  static memberRow(username) {
    return cy.findByRole('grid').findByRole('row', { name: new RegExp(username) });
  }

  /** Checkbox inside a row of the Assignment Members grid. */
  static memberRowCheckbox(username) {
    return AssignmentDetailPage.memberRow(username).findByRole('checkbox');
  }

  // -------- Managed Roles tab --------

  /** "Add Managed Roles" button on the Managed Roles tab. */
  static get addManagedRolesButton() {
    return cy.findByRole('button', { name: /^Add Managed Roles$/i });
  }

  /** "Add Managed Roles" modal. */
  static get addManagedRolesDialog() {
    return cy.findByRole('dialog', { name: /^Add Managed Roles$/i });
  }

  /** Combobox inside the Add Managed Roles modal. */
  static get managedRolesCombobox() {
    return AssignmentDetailPage.addManagedRolesDialog.findByRole('combobox', { name: /Managed Roles/i });
  }

  /** A role option in the managed roles combobox dropdown (by name). */
  static managedRoleOption(roleName) {
    return cy.findByRole('option', { name: new RegExp(roleName, 'i') });
  }

  /** Save button inside the Add Managed Roles modal. */
  static get addManagedRolesSaveButton() {
    return AssignmentDetailPage.addManagedRolesDialog.findByRole('button', { name: 'Save' });
  }

  /** A row in the Managed Roles grid by role name. */
  static managedRoleRow(roleName) {
    return cy.findByRole('grid').findByRole('row', { name: new RegExp(roleName) });
  }

  /** Checkbox inside a row of the Managed Roles grid. */
  static managedRoleRowCheckbox(roleName) {
    return AssignmentDetailPage.managedRoleRow(roleName).findByRole('checkbox');
  }

  // -------- Shared: Remove flow on relationship tabs --------

  /** Search box on the relationship tab (Assignment Members / Managed Roles). */
  static get relationshipSearchBox() {
    return cy.findByRole('searchbox', { name: 'Search' });
  }

  /** Remove button shown above the relationship grid after at least one row is selected. */
  static get removeButton() {
    return cy.findByRole('button', { name: 'Remove' });
  }

  /** Confirmation dialog shown when removing relationships. */
  static get confirmRemovalDialog() {
    return cy.findByRole('dialog', { name: /Remove|Confirm/i });
  }

  /** Cancel button inside the removal dialog. */
  static get confirmRemovalCancelButton() {
    return AssignmentDetailPage.confirmRemovalDialog.findByRole('button', { name: 'Cancel' });
  }

  /** Confirm/Remove button inside the removal dialog. */
  static get confirmRemovalButton() {
    return AssignmentDetailPage.confirmRemovalDialog.findByRole('button', { name: 'Remove' });
  }

  // -------- Delete assignment --------

  /**
   * Delete button on the assignment detail page — label includes the identity display name
   * ("Delete Alpha realm - Assignment" on cloud, "Delete Assignment" on ForgeOps).
   */
  static deleteAssignmentButton(displayName) {
    return cy.findByRole('button', { name: `Delete ${displayName}` });
  }

  /** Confirmation dialog shown after clicking Delete on the assignment detail page. */
  static get deleteAssignmentDialog() {
    return cy.findByRole('dialog', { name: /Delete .*Assignment\?/i });
  }

  /** Delete confirm button inside the delete dialog. */
  static get deleteAssignmentConfirmButton() {
    return AssignmentDetailPage.deleteAssignmentDialog.findByRole('button', { name: 'Delete' });
  }
}
