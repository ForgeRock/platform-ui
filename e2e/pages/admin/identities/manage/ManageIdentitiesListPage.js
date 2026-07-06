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
   */
  static tab(name) {
    return cy.findByRole('tab', { name });
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
}
