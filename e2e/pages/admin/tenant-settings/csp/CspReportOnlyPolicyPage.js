/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../../BaseAdminPage';

export default class CspReportOnlyPolicyPage extends BaseAdminPage {
  // ── Policy Status ─────────────────────────────────────────────────────────────

  static get policyStatus() {
    // Badge has no semantic role; :visible avoids matching the hidden tab pane
    return cy.get('[data-testid="csp-status"]:visible');
  }

  static get toggleStatusButton() {
    return cy.get('[data-testid="csp-toggle-status"]:visible');
  }

  // ── Notifications / Warnings ──────────────────────────────────────────────────

  static get publishChangesButton() {
    return cy.findByRole('button', { name: 'Publish' });
  }

  // ── Directives Table ──────────────────────────────────────────────────────────

  static get addDirectiveButton() {
    return cy.findByRole('button', { name: /add directive/i });
  }

  static get noDirectivesMessage() {
    return cy.findByText(/you haven't added any directives yet/i);
  }

  static directiveRow(directiveName) {
    return CspReportOnlyPolicyPage.pageTable
      .findByRole('cell', { name: directiveName })
      .closest('tr');
  }

  static directiveRowCell(directiveName, cellName) {
    return CspReportOnlyPolicyPage.directiveRow(directiveName).findByRole('cell', { name: cellName });
  }

  static get directiveColumnHeader() {
    return CspReportOnlyPolicyPage.pageTable.findByRole('columnheader', { name: /directive/i });
  }

  static get firstDirectiveCell() {
    return CspReportOnlyPolicyPage.pageTable.find('td.directive-column').first();
  }
}
