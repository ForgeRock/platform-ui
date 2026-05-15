/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseEnduserPage from './BaseEnduserPage';

export default class DashboardPage extends BaseEnduserPage {
  static visit() {
    const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
    cy.visit(`${Cypress.config().baseUrl}/enduser/?realm=${realm}#/dashboard`);
    DashboardPage.welcomeGreeting.should('be.visible');
  }

  // ── Welcome section ───────────────────────────────────────────────────────────

  static get welcomeGreeting() {
    return cy.get('[data-testid="dashboard-welcome-greeting"]');
  }

  static get editProfileButton() {
    return cy.findByRole('button', { name: /edit your profile/i });
  }
}
