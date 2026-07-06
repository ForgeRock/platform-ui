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
}
