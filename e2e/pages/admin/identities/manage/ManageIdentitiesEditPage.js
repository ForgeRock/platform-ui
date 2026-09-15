/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

/** Page object for the Identities > Manage edit page. */
export default class ManageIdentitiesEditPage extends BaseAdminPage {
  /**
   * The "Linked Systems" tab on the identity edit page.
   * Rendered as "Applications" when workforce features are disabled.
   */
  static get linkedSystemsTab() {
    return cy.findByRole('tab', { name: 'Linked Systems' });
  }

  /**
   * The "Delete {displayName}" button inside the delete panel card at the bottom of the edit page.
   *
   * @param {string} displayName - The translated identity type label shown on the button
   *   (e.g. "Alpha realm - User" on cloud, "User" on ForgeOps).
   */
  static deleteButton(displayName) {
    return cy.findByRole('button', { name: `Delete ${displayName}` });
  }

  /** All tabs of the identity edit page (Details plus the schema/relationship tabs). */
  static get allTabs() {
    return cy.findAllByRole('tab');
  }

  /** The "Reset Password" button on the user edit page (shown when the admin can change the password). */
  static get resetPasswordButton() {
    return cy.findByRole('button', { name: 'Reset Password' });
  }

  /** The Save button in the Details tab's card footer. */
  static get saveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }

  /**
   * The `<code>` element in the identity header block showing the identity's
   * secondary title (the username for users) — scoped to the header media body.
   */
  static get userNameCode() {
    return cy.get('.media-body').find('code');
  }
}
