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

  /**
   * Visits the jobs page with a stubbed list of jobs — use when real job creation
   * isn't possible (e.g. full/incremental recon require a connector).
   *
   * Filtering is server-side: every filter selection fires a new GET with a different
   * `_queryFilter` value. The intercept inspects that param and returns only the
   * matching subset of `jobs`, mimicking what the real backend would do.
   *
   * @param {Object[]} jobs - Array of job objects to stub in the response
   */
  static visitWithMockedJobs(jobs) {
    const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';

    const matchesType = (job, queryFilter) => {
      // The view-filter dropdown adds one of these clauses to the queryFilter param;
      // see packages/platform-admin/src/utils/jobsUtils.js getFilterByType().
      if (queryFilter.includes('invokeContext/action/ eq "reconcile"')) {
        return job.invokeContext?.action === 'reconcile';
      }
      if (queryFilter.includes('invokeContext/action/ eq "livesync"')) {
        return job.invokeContext?.action === 'liveSync';
      }
      if (queryFilter.includes('invokeContext/task/ pr')) {
        return !!job.invokeContext?.task;
      }
      if (queryFilter.includes('invokeContext/script/ pr')) {
        return !!job.invokeContext?.script;
      }
      return true; // "All Jobs"
    };

    cy.intercept({ method: 'GET', url: '**/openidm/scheduler/job**' }, (req) => {
      const queryFilter = (req.query?._queryFilter ?? '').toString();
      const filtered = jobs.filter((j) => matchesType(j, queryFilter));
      req.reply({
        statusCode: 200,
        body: { result: filtered, totalPagedResults: filtered.length },
      });
    }).as('getJobsMocked');

    cy.visit(`${Cypress.config().baseUrl}/platform/?realm=${realm}#/jobs`);

    cy.wait('@getJobsMocked', { timeout: 15000 });
    cy.findByTestId('spinner-is-loading-jobs').should('not.exist');
    JobsPage.scheduleJobButton.should('be.visible');
  }

  static get pageAlert() {
    return cy.get('[data-testid="FrAlert"]', { timeout: 10000 });
  }

  // ── Empty state ───────────────────────────────────────────────────────────────

  static get emptyStateTitle() {
    return cy.findByRole('heading', { name: /no jobs scheduled/i });
  }

  static get emptyStateSubtitle() {
    return cy.findByText(/any scheduled jobs will appear here/i);
  }

  static get emptySearchState() {
    return cy.findByRole('heading', { name: /no scheduled jobs found/i });
  }

  // ── View filter ───────────────────────────────────────────────────────────────

  static get viewFilterDropdown() {
    return cy.findByRole('button', { name: /view:/i });
  }

  static viewFilterOption(label) {
    return cy.findByRole('menuitem', { name: new RegExp(label, 'i') });
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
    // Match the row by its accessible name so the query is a single retried step —
    // chaining .findByRole('cell').closest('tr') would crash mid-chain (and surface as
    // a misleading "Unable to find role=cell" error) when the row is absent, breaking
    // negative `should('not.exist')` assertions.
    return JobsPage.table.findByRole('row', { name: new RegExp(jobName, 'i') });
  }

  static jobStatusBadge(jobName) {
    return JobsPage.jobRow(jobName).find('.badge');
  }

  static jobNextRunDateCell(jobName) {
    return JobsPage.jobRow(jobName).find('[role="cell"]').eq(1);
  }

  static get runningJobDetails() {
    return cy.findByText(/currently executing on/i);
  }
}
