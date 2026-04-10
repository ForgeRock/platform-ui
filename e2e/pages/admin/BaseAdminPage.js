/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class BaseAdminPage {
  static get pageTable() {
    return cy.findByRole('table');
  }

  static get pageAlert() {
    return cy.get('[data-testid="FrAlert"]');
  }

  static get tenantSettingsBreadcrumb() {
    return cy.findByRole('link', { name: /tenant settings/i });
  }
}
