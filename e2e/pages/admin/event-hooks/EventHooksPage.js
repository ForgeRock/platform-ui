/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class EventHooksPage extends BaseAdminPage {
  static visit() {
    const eventsUrl = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/events' : '/platform/#/events';

    cy.intercept('GET', '**/openidm/config/managed').as('managedConfig');
    cy.visit(eventsUrl);
    cy.wait('@managedConfig', { timeout: 15000 });
    EventHooksPage.reloadOnManagedConfigError();
    EventHooksPage.newEventHookButton.should('be.visible');
  }

  static visitWithEmptyHooks() {
    const eventsUrl = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/events' : '/platform/#/events';

    cy.intercept('GET', '**/openidm/config/managed', {
      body: { objects: [] },
    }).as('managedConfig');
    cy.visit(eventsUrl);
    cy.wait('@managedConfig', { timeout: 15000 });
    EventHooksPage.newEventHookButton.should('be.visible');
  }

  /**
   * Helper method to to retry if we an "Access Denied" error after navigation.
   * Remove this after: https://pingidentity.atlassian.net/browse/IAM-10852
   */
  static reloadOnManagedConfigError() {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="FrAlert"].alert-danger').length === 0) return;

      cy.log('[visit] Load error detected — reloading');
      cy.intercept('GET', '**/openidm/config/managed').as('managedConfigRetry');
      cy.reload();
      cy.wait('@managedConfigRetry', { timeout: 15000 });
    });
  }

  // ── Alerts ────────────────────────────────────────────────────────────────────

  static get pageAlert() {
    return cy.get('[data-testid="FrAlert"]', { timeout: 10000 });
  }

  // ── Page Header ───────────────────────────────────────────────────────────────

  static get pageHeading() {
    return cy.findByRole('heading', { name: 'Event Hooks', level: 1 });
  }

  // ── Toolbar ───────────────────────────────────────────────────────────────────

  static get newEventHookButton() {
    return cy.findByRole('button', { name: /new event hook/i });
  }

  static get searchInput() {
    return cy.findByRole('searchbox', { name: /search/i });
  }

  // ── Pagination ────────────────────────────────────────────────────────────────

  static get paginationNextButton() {
    return cy.get('button[aria-label="Go to next page"]');
  }

  static get paginationPageSizeButton() {
    return cy.get('[data-testid="page_size-button"]');
  }

  // ── Table ─────────────────────────────────────────────────────────────────────

  static get table() {
    return cy.findByRole('table');
  }

  // Column header accessible name includes the sort hint, so match by partial text anchored at start
  static columnHeader(name) {
    return cy.findByRole('columnheader', { name: new RegExp(`^${name}`, 'i') });
  }

  // First data row (row index 1; row index 0 is the header row)
  static get firstDataRow() {
    return EventHooksPage.table.findAllByRole('row').eq(1);
  }

  static hookRows(hookName) {
    return EventHooksPage.table.findAllByRole('cell', { name: hookName });
  }

  static hookRow(hookName) {
    return EventHooksPage.table
      .findByRole('cell', { name: hookName })
      .closest('tr');
  }

  static hookRowCell(hookName, cellName) {
    return EventHooksPage.hookRow(hookName).findByRole('cell', { name: cellName });
  }

  // Asserts that firstHookName appears in an earlier table row than secondHookName.
  // More robust than checking firstDataRow when pre-existing rows may be present.
  static assertHookOrder(firstHookName, secondHookName) {
    EventHooksPage.table.findAllByRole('row').then(($rows) => {
      const texts = [...$rows].map(($row) => $row.textContent);
      const firstIndex = texts.findIndex((t) => t.includes(firstHookName));
      const secondIndex = texts.findIndex((t) => t.includes(secondHookName));
      expect(firstIndex, `"${firstHookName}" not found in table`).to.be.greaterThan(0);
      expect(secondIndex, `"${secondHookName}" not found in table`).to.be.greaterThan(0);
      expect(firstIndex, `"${firstHookName}" should appear before "${secondHookName}"`).to.be.lessThan(secondIndex);
    });
  }
}
