/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

/** Page object for the managed Roles list (Identities > Manage > Roles tab) and the New Role wizard. */
export default class RolesPage extends BaseAdminPage {
  /** "New Alpha realm - Role" button on cloud, "New Role" button on ForgeOps. */
  static get newRoleButton() {
    return cy.findByRole('button', { name: /^New .*Role$/, timeout: 5000 });
  }

  /** Search box on the Roles list. */
  static get searchBox() {
    return cy.findByRole('searchbox', { name: 'Search' });
  }

  /**
   * Row in the Roles table for a given role.
   * Note: cloud renders the table without the description cell for empty descriptions,
   * so we match on row name starting with the role name.
   */
  static roleRow(roleName) {
    return cy.findByRole('table').findByRole('row', { name: new RegExp(`^${roleName}`) });
  }

  /** Empty-state heading shown when a search returns no results. */
  static get noResultsHeading() {
    return cy.findByRole('heading', { name: /^No .*roles Found$/i });
  }

  /** Empty-state container shown when a search returns no results ("No Roles Found"). */
  static get noResultsState() {
    return cy.get('[data-testid="no-resources-found"]');
  }

  // -------- New Role wizard --------

  /** Step 1 dialog — header reads "New Alpha realm - role" (lowercase role) on cloud. */
  static get newRoleDialog() {
    return cy.findByRole('dialog', { name: /^New .*role$/i });
  }

  /** Step 2 dialog — "Dynamic Alpha realm - role Assignment" on cloud. */
  static get dynamicAssignmentDialog() {
    return cy.findByRole('dialog', { name: /Dynamic.*Assignment/i });
  }

  /** Step 3 (final) dialog — "Time Constraint" (singular; distinct from the
   * Settings-tab dialog which is titled "Temporal Constraints"). */
  static get timeConstraintDialog() {
    return cy.findByRole('dialog', { name: 'Time Constraint' });
  }

  /** Name input scoped to the New Role wizard's Step 1 dialog. */
  static get nameInput() {
    return RolesPage.newRoleDialog.findByLabelText('Name');
  }

  /** Description (optional) input scoped to the New Role wizard's Step 1 dialog. */
  static get descriptionInput() {
    return RolesPage.newRoleDialog.findByLabelText(/Description \(optional\)/i);
  }

  /** Next button inside the New Role wizard's Step 1 dialog. */
  static get nextButton() {
    return RolesPage.newRoleDialog.findByRole('button', { name: 'Next' });
  }

  /** Validation error alert shown under the Name field when the field is left empty. */
  static get nameValidationError() {
    return RolesPage.newRoleDialog.find('[role="alert"]').filter(':visible');
  }

  // -------- Post-save step (shown after wizard Save) --------

  /**
   * "View Role" primary button on the post-save screen shown after role creation.
   * The button label is "View {objectType}" where objectType is derived from the
   * resource title — always "Role" for managed roles on both cloud and ForgeOps.
   */
  static get postSaveViewButton() {
    return cy.findByRole('button', { name: 'View Role' });
  }

  /** "Create another" outline button on the post-save screen. */
  static get postSaveCreateAnotherButton() {
    return cy.findByRole('button', { name: 'Create another' });
  }
}
