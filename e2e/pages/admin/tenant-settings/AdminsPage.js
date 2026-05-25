/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class AdminsPage {
  // ── Toolbar ───────────────────────────────────────────────────────────────────

  static get inviteAdminsButton() {
    return cy.findByRole('button', { name: /invite admins/i });
  }

  static get searchInput() {
    return cy.findByRole('searchbox', { name: /search/i });
  }

  static clearSearch() {
    cy.findByRole('button', { name: /clear/i }).click();
  }

  // ── Table ─────────────────────────────────────────────────────────────────────

  static get table() {
    return cy.findByTestId('managed-resources-table');
  }

  static get rows() {
    return AdminsPage.table.find('tbody tr');
  }

  static row(userName) {
    return AdminsPage.table.contains('tr', userName);
  }

  // ── Row actions menu ──────────────────────────────────────────────────────────

  static actionsMenuButton(userName) {
    return AdminsPage.row(userName).find('button[aria-haspopup="true"]');
  }

  static resendInviteMenuItem() {
    return cy.findByRole('menuitem', { name: /resend email invite/i });
  }

  static deleteMenuItem() {
    return cy.findByRole('menuitem', { name: /delete/i });
  }

  // ── Delete confirmation modal ─────────────────────────────────────────────────

  static get deleteModal() {
    return cy.findByRole('dialog', { name: /delete/i });
  }

  static get confirmDeleteButton() {
    return AdminsPage.deleteModal.findByRole('button', { name: /^delete$/i });
  }

  // ── Pagination ────────────────────────────────────────────────────────────────

  static get nextPageButton() {
    return cy.findByTestId('next_page-button').closest('li');
  }

  static clickNextPage() {
    cy.findByTestId('next_page-button').click();
  }

  static clickPreviousPage() {
    cy.findByTestId('prev_page-button').click();
  }
}
