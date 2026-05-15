/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class BaseEnduserPage {
  // ── Notifications ─────────────────────────────────────────────────────────────

  static get pageAlert() {
    return cy.findByRole('alert', { timeout: 10000 });
  }

  // ── Sidebar navigation ────────────────────────────────────────────────────────

  static get sidebarNav() {
    return cy.get('[data-testid="fr-sidebar-nav"]');
  }

  static get dashboardNavLink() {
    return BaseEnduserPage.sidebarNav.findByRole('link', { name: /dashboard/i });
  }

  static get reportsNavLink() {
    return BaseEnduserPage.sidebarNav.findByRole('link', { name: /reports/i });
  }

  static get applicationsNavLink() {
    return BaseEnduserPage.sidebarNav.findByRole('link', { name: /applications/i });
  }

  static get profileNavLink() {
    return BaseEnduserPage.sidebarNav.findByRole('link', { name: /profile/i });
  }
}
