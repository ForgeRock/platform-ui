/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

/**
 * Page object for the Manage Identities list page.
 * Used specifically for the search-filter-related selectors exercised by ConfigureIdentitiesSteps.
 */
export default class ManageIdentitiesPage extends BaseAdminPage {
  /** The search input on the Manage Identities list page. */
  static get searchInput() {
    return cy.findByRole('searchbox', { name: 'Search' });
  }

  /**
   * The filter-length hint shown when the search input is focused.
   * Reads "Type at least N characters" and gains `text-danger` + `shake` classes when the
   * user submits a search that is too short.
   *
   * @param {number} minChars - The configured minimum character threshold.
   */
  static filterLengthHint(minChars) {
    return cy.findByText(`Type at least ${minChars} characters`);
  }

  /** The "Press Enter" hint shown when the search input has enough characters. */
  static get pressEnterHint() {
    return cy.findByText('Press Enter');
  }
}
