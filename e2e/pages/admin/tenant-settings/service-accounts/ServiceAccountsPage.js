/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default class ServiceAccountsPage {
  static get searchInput() {
    return cy.findByRole('searchbox', { name: 'Search' });
  }

  static tableCell(name) {
    return cy.findByRole('cell', { name, timeout: 5000 });
  }

  static tableRowForItem(name) {
    return cy.findAllByRole('row').filter(`:has(td:contains("${name}"))`);
  }
}
