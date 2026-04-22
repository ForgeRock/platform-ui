/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class RealmSettingsPage {
  static get detailsTab() {
    return cy.findByRole('tab', { name: 'Details' });
  }

  static get customDomainTab() {
    return cy.findByRole('tab', { name: 'Custom Domain' });
  }
}
