/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class JobsPage extends BaseAdminPage {
  static visit() {
    cy.openJobListPage();
  }

  static visitWithEmptyJobs() {
    const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';

    cy.intercept('GET', '**/openidm/scheduler/job**', {
      body: { result: [], totalPagedResults: 0 },
    }).as('getJobsEmpty');

    cy.visit(`${Cypress.config().baseUrl}/platform/?realm=${realm}#/jobs`);
    cy.wait('@getJobsEmpty', { timeout: 15000 });
    JobsPage.scheduleJobButton.should('be.visible');
  }

  // ── Empty state ───────────────────────────────────────────────────────────────

  static get emptyStateTitle() {
    return cy.findByRole('heading', { name: /no jobs scheduled/i });
  }

  static get emptyStateSubtitle() {
    return cy.findByText(/any scheduled jobs will appear here/i);
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────────

  static get scheduleJobButton() {
    return cy.findByRole('button', { name: /schedule a job/i });
  }

  static get searchInput() {
    return cy.findByRole('searchbox', { name: /search/i });
  }

  // ── Table ─────────────────────────────────────────────────────────────────────

  static get table() {
    return cy.findByRole('table');
  }

  static get columnHeaderName() {
    return JobsPage.table.findByRole('columnheader', { name: /^name/i });
  }

  static get columnHeaderNextScheduledRun() {
    return JobsPage.table.findByRole('columnheader', { name: /next scheduled run/i });
  }

  static get columnHeaderStatus() {
    return JobsPage.table.findByRole('columnheader', { name: /^status/i });
  }

  static jobRow(jobName) {
    return JobsPage.table
      .findByRole('cell', { name: new RegExp(jobName, 'i') })
      .closest('tr');
  }

  static jobStatusBadge(jobName) {
    return JobsPage.jobRow(jobName).find('.badge');
  }

  static jobNextRunDateCell(jobName) {
    return JobsPage.jobRow(jobName).find('[role="cell"]').eq(1);
  }
}
