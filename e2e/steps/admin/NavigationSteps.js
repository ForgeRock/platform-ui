/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import DashboardAdminPage from '@e2e/pages/admin/dashboard/DashboardAdminPage';

export default class NavigationSteps {
  static clickBreadcrumb() {
    cy.findByRole('navigation', { name: 'Header navigation' })
      .should('be.visible')
      .find('[aria-label^="Back to"]')
      .click();
  }

  static navigateToDashboard() {
    DashboardAdminPage.sidebar.findByRole('link', { name: /^dashboard$/i }).click();
  }

  static navigateToApplications() {
    DashboardAdminPage.sidebar.findByRole('link', { name: /^applications$/i }).click();
  }
}
