/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Page Object Model for the AI Agents list page (/ai-agents).
 */
export default class AIAgentsPage {
  static visit() {
    const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
    cy.visit(`/platform/?realm=${realm}#/ai-agents`);
  }

  // Page header
  static get heading() {
    return cy.findByRole('heading', { name: /ai agents/i });
  }

  // Toolbar
  static get addAgentButton() {
    // The list page shows the button both in the empty state and in the toolbar;
    // the toolbar button only exists once at least one agent is present.
    return cy.findAllByRole('button', { name: /add ai agent/i }).first();
  }

  static get searchInput() {
    return cy.findByRole('searchbox', { name: /search/i });
  }

  // Table
  static get table() {
    return cy.findByRole('table');
  }

  static agentRow(agentName) {
    return AIAgentsPage.table.contains('tr', agentName);
  }

  static agentRowStatus(agentName) {
    return AIAgentsPage.agentRow(agentName).findByTestId('status-badge');
  }
}
