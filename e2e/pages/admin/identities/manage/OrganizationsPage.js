/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

/** Page object for the managed Organizations list (Identities > Manage > Organizations tab) and the New Organization modal. */
export default class OrganizationsPage extends BaseAdminPage {
  /** "New Alpha realm - organization" button on cloud, "New organization" button on ForgeOps. */
  static get newOrganizationButton() {
    return cy.findByRole('button', { name: /^New .*[Oo]rganization$/, timeout: 5000 });
  }

  /** Search box on the Organizations list. */
  static get searchBox() {
    return cy.findByRole('searchbox', { name: 'Search' });
  }

  /** New Organization dialog — single-step modal (unlike Roles which has 3 steps). */
  static get newOrganizationDialog() {
    return cy.findByRole('dialog', { name: /^New .*[Oo]rganization$/ });
  }

  /** Name input inside the New Organization dialog. */
  static get nameInput() {
    return cy.findByLabelText('Name');
  }

  /** Validation error alert shown under the Name field when the field is left empty. */
  static get nameValidationError() {
    return cy.findByRole('dialog', { name: /^New .*[Oo]rganization$/ }).find('[role="alert"]').filter(':visible');
  }

  /** Assert Save is still disabled on the open New Organization dialog (e.g. after a validation trigger). */
  static verifyNewOrgDialogSaveDisabled() {
    return OrganizationsPage.newOrganizationDialog.within(() => {
      cy.findByRole('button', { name: 'Save' }).should('be.disabled');
    });
  }

  /** Assert the New Organization dialog is open with Save disabled, Cancel visible, and Name input visible. */
  static verifyNewOrgDialogOpen() {
    return OrganizationsPage.newOrganizationDialog.should('be.visible').within(() => {
      cy.findByRole('button', { name: 'Save' }).should('be.disabled');
      cy.findByRole('button', { name: 'Cancel' }).should('be.visible');
      OrganizationsPage.nameInput.should('be.visible');
    });
  }

  /** Success modal shown after a new organization is created (replaces navigation to detail page). */
  static get creationSuccessDialog() {
    return cy.findByRole('dialog', { name: /organization successfully created/i });
  }

  /** "View Organization" button inside the creation success modal. */
  static get viewOrganizationButton() {
    return OrganizationsPage.creationSuccessDialog.findByRole('button', { name: /view organization/i });
  }

  /** "Create another" button inside the creation success modal. */
  static get createAnotherButton() {
    return OrganizationsPage.creationSuccessDialog.findByRole('button', { name: /create another/i });
  }

  /** "Done" button inside the creation success modal. */
  static get creationSuccessDoneButton() {
    return OrganizationsPage.creationSuccessDialog.findByRole('button', { name: 'Done' });
  }

  /** Empty-state heading shown when a search returns no results. */
  static get noResultsHeading() {
    return cy.findByRole('heading', { name: /^No .*[Oo]rganizations? Found$/i });
  }

  /** Row cell linking to an organization by name (used to assert presence/absence in the list). */
  static organizationCell(orgName) {
    return cy.findByRole('table').findByRole('cell', { name: orgName });
  }
}
