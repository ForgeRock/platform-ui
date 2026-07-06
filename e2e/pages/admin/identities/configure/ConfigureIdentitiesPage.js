/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

/** Page object for the Identities > Configure list page (Managed Object Types). */
export default class ConfigureIdentitiesPage extends BaseAdminPage {
  /** "Managed Object Types" heading — present once the page finishes loading. */
  static get heading() {
    return cy.findByRole('heading', { name: 'Managed Object Types' });
  }

  /** The managed object types table. */
  static get table() {
    return cy.findByRole('table');
  }

  /** Search box used to filter the managed object type list. */
  static get searchBox() {
    return cy.findByRole('searchbox', { name: 'Search' });
  }

  /**
   * A row in the managed object types table matching the given display name.
   *
   * @param {string} name - Display name of the object type row.
   */
  static row(name) {
    return cy.findByRole('row', { name: new RegExp(`^${name}`) });
  }
}
