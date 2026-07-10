/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class DashboardAdminPage extends BaseAdminPage {
  static visit() {
    const dashboardUrl = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/dashboard' : '/platform/#/dashboard/overview';

    cy.visit(dashboardUrl);
    DashboardAdminPage.dashboardTitle.should('be.visible');
  }

  static assertSidebarCollapsed() {
    cy.get('#app').should('have.class', 'fr-menu-collapsed');
  }

  static assertSidebarExpanded() {
    cy.get('#app').should('have.class', 'fr-menu-expanded');
  }

  static get dashboardTitle() {
    return cy.get('[data-testid="dashboard-welcome-title"]');
  }

  static get sidebar() {
    return cy.get('[data-testid="fr-sidebar-nav"]');
  }

  static get sidebarToggleButton() {
    return DashboardAdminPage.sidebar.find('.fr-sidebar-bottom button');
  }

  static get nativeConsolesButton() {
    return DashboardAdminPage.sidebar.findByRole('button', { name: /native consoles/i });
  }

  static get amNativeConsoleLink() {
    return DashboardAdminPage.sidebar.findByRole('link', { name: /access management/i });
  }

  static get idmNativeConsoleLink() {
    return DashboardAdminPage.sidebar.findByRole('link', { name: /identity management/i });
  }
}
