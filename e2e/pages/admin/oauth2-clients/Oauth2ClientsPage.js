/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class Oauth2ClientsPage {
  static visit() {
    const url = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/oauth-clients' : '/platform/#/oauth-clients';
    cy.visit(url);
  }

  // ── Page Header ───────────────────────────────────────────────────────────────

  static get heading() {
    return cy.findByRole('heading', { name: /oauth2 clients/i });
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────────

  static get searchInput() {
    return cy.findByRole('searchbox', { name: /search/i });
  }

  // ── Table ─────────────────────────────────────────────────────────────────────

  static get table() {
    return cy.findByRole('table');
  }

  static clientRow(clientName) {
    return Oauth2ClientsPage.table.contains('tr', clientName);
  }

  static clientRowStatus(clientName) {
    return Oauth2ClientsPage.clientRow(clientName).findByRole('cell', { name: /active|inactive/i });
  }
}
