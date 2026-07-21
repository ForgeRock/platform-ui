/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/** Page object for the managed Organization detail/edit page (Identities > Manage > Organizations > [organization]). */
export default class OrganizationDetailPage {
  /** Page heading showing the organization name. */
  static orgHeading(orgName) {
    return cy.findByRole('heading', { name: orgName, timeout: 15000 });
  }

  /** Sub-heading showing the identity type — "Alpha realm - Organization" on cloud, "Organization" on ForgeOps. */
  static identityTypeHeading(displayName) {
    return cy.findByRole('heading', { name: displayName, timeout: 15000 });
  }

  /** "Details" tab — open by default. */
  static get detailsTab() {
    return cy.findByRole('tab', { name: 'Details' });
  }

  /** "Administrators" tab on the organization detail page. */
  static get administratorsTab() {
    return cy.findByRole('tab', { name: 'Administrators' });
  }

  /** "Members" tab on the organization detail page. */
  static get membersTab() {
    return cy.findByRole('tab', { name: 'Members' });
  }

  /** "Owner" tab on the organization detail page. */
  static get ownerTab() {
    return cy.findByRole('tab', { name: 'Owner' });
  }

  /** "Raw JSON" tab on the organization detail page. */
  static get rawJsonTab() {
    return cy.findByRole('tab', { name: 'Raw JSON' });
  }

  /**
   * Delete button on the organization detail page — label includes the identity display name
   * ("Delete Alpha realm - Organization" on cloud, "Delete Organization" on ForgeOps).
   */
  static deleteOrgButton(displayName) {
    return cy.findByRole('button', { name: `Delete ${displayName}` });
  }

  /** Confirmation dialog shown after clicking Delete on the organization detail page. */
  static get deleteOrgDialog() {
    return cy.findByRole('dialog', { name: /Delete .*[Oo]rganization\?/i });
  }

  /** Delete confirm button inside the delete dialog. */
  static get deleteOrgConfirmButton() {
    return OrganizationDetailPage.deleteOrgDialog.findByRole('button', { name: 'Delete' });
  }

  /**
   * "+Add X" button on a relationship tab (Administrators / Members / Owner).
   * @param {string} label — full button label fragment, e.g. "Add Administrators".
   */
  static addRelationshipButton(label) {
    return cy.findByRole('button', { name: new RegExp(label, 'i') });
  }

  /** Modal opened from the "+Add X" button on a relationship tab. */
  static addRelationshipDialog(label) {
    return cy.findByRole('dialog', { name: new RegExp(label, 'i') });
  }

  /** Combobox inside the add-relationship modal — the combobox aria-label is the field name
   * ("Administrators" / "Members" / "Owner"), not the modal title ("Add ..."). */
  static relationshipCombobox(label) {
    const fieldName = label.replace(/^Add\s+/i, '');
    return OrganizationDetailPage.addRelationshipDialog(label)
      .findByRole('combobox', { name: new RegExp(`^${fieldName}$`, 'i') });
  }

  /** Assert the add-relationship modal is open with Save disabled and Cancel visible. */
  static verifyAddRelationshipDialogOpen(label) {
    return OrganizationDetailPage.addRelationshipDialog(label).within(() => {
      cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      cy.findByRole('button', { name: 'Cancel' }).should('be.visible');
    });
  }

  /** Save button inside the add-relationship modal. */
  static addRelationshipSaveButton(label) {
    return OrganizationDetailPage.addRelationshipDialog(label).findByRole('button', { name: 'Save' });
  }

  /** A user option in the combobox dropdown (by username). */
  static relationshipUserOption(username) {
    return cy.findByRole('option', { name: new RegExp(username, 'i') });
  }

  /** Search box on the relationship tab (Administrators / Members / Owner). */
  static get relationshipSearchBox() {
    return cy.findByRole('searchbox', { name: 'Search' });
  }

  /** Empty state shown on Administrators / Members / Owner tabs when no records are present.
   * All tabs pre-render their grids, so the empty-state text appears multiple times in the DOM;
   * filter to the visible one. */
  static get emptyRelationshipState() {
    return cy.findAllByText('There are no records to show').filter(':visible').first();
  }

  /** A row in the relationship grid by username. */
  static relationshipRow(username) {
    return cy.findByRole('grid').findByRole('row', { name: new RegExp(username) });
  }

  /** Checkbox inside a row of the Members grid. */
  static memberRowCheckbox(username) {
    return OrganizationDetailPage.relationshipRow(username).findByRole('checkbox');
  }

  /** Name input on the Details tab. */
  static get detailsNameInput() {
    return cy.findByRole('textbox', { name: 'Name' });
  }

  /** Description input on the Details tab. */
  static get detailsDescriptionInput() {
    return cy.findByRole('textbox', { name: 'Description' });
  }

  /** Parent Organization singleton combobox on the Details tab. */
  static get detailsParentOrganizationCombobox() {
    return cy.findByRole('combobox', { name: 'Parent Organization' });
  }

  /** A dropdown option in the Parent Organization combobox. */
  static parentOrganizationOption(orgName) {
    return cy.findByRole('option', { name: new RegExp(orgName, 'i') });
  }

  /** Save button on the Details tab. */
  static get detailsSaveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }

  /** Remove button shown above the Members grid after at least one row is selected. */
  static get removeButton() {
    return cy.findByRole('button', { name: 'Remove' });
  }

  /** Confirmation dialog shown when removing relationships. */
  static get confirmRemovalDialog() {
    return cy.findByRole('dialog', { name: /Remove|Confirm/i });
  }

  /** Confirm button inside the removal dialog. */
  static get confirmRemovalButton() {
    return OrganizationDetailPage.confirmRemovalDialog.findByRole('button', { name: 'Remove' });
  }
}
