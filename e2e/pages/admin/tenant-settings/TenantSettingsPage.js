/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export default class TenantSettingsPage {
  static visit() {
    cy.visit(`${Cypress.config().baseUrl}/platform/?realm=alpha#/tenant-settings/global-settings`);
  }

  static get detailsTab() {
    return cy.findByRole('tab', { name: 'Details' });
  }

  static get adminsTab() {
    return cy.findByRole('tab', { name: 'Admins' });
  }

  static get federationTab() {
    return cy.findByRole('tab', { name: 'Federation' });
  }

  static get globalSettingsTab() {
    return cy.findByRole('tab', { name: 'Global Settings' });
  }
}
