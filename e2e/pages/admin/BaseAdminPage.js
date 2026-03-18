/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default class BaseAdminPage {
  static get pageTable() {
    return cy.findByRole('table');
  }

  static get pageAlert() {
    return cy.get('[data-testid="FrAlert"]');
  }
}
