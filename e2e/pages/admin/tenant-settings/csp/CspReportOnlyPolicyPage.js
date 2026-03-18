/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
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
}
