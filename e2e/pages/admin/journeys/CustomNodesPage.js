/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';
import DashboardAdminPage from '../dashboard/DashboardAdminPage';

const realm = () => (Cypress.env('IS_FRAAS') ? 'alpha' : 'root');

export default class CustomNodesPage extends BaseAdminPage {
  static visit() {
    cy.visit(`/platform/?realm=${realm()}#/custom-nodes`);
    CustomNodesPage.assertReady();
  }

  static visitViaSidebar() {
    DashboardAdminPage.sidebar.findByRole('button', { name: /^journeys$/i })
      .scrollIntoView()
      .then(([button]) => {
        if (button.getAttribute('aria-expanded') !== 'true') {
          cy.wrap(button).click();
        }
      });
    DashboardAdminPage.sidebar.findByRole('link', { name: /^custom nodes$/i })
      .scrollIntoView()
      .click();
    CustomNodesPage.assertReady();
  }

  static assertReady() {
    cy.findByRole('button', { name: 'Add New Custom Node', timeout: 15000 }).should('be.visible');
  }

  // ── Toolbar buttons ───────────────────────────────────────────────────────

  static get addNodeButton() {
    // Uses role/name so it matches BOTH the populated-state toolbar button
    // (which has `data-testid="add-node-btn"`) AND the empty-state button
    // (rendered inside FrNoData without a testid).
    return cy.findByRole('button', { name: 'Add New Custom Node' });
  }

  static get importButton() {
    // Matches both the empty-state ("Import Nodes") and the populated-state
    // ("Import") toolbar buttons — only the populated-state one carries
    // `data-testid="import-node-btn"`.
    return cy.findByRole('button', { name: /^Import( Nodes)?$/ });
  }

  // ── Search ────────────────────────────────────────────────────────────────

  static get searchInput() {
    return cy.findByRole('searchbox', { name: 'Search' });
  }

  static get noSearchResultsHeading() {
    return cy.findByRole('heading', { name: 'No Custom Nodes found.' });
  }

  // ── Table rows ────────────────────────────────────────────────────────────

  static nodeRow(name) {
    return cy.findByRole('row', { name: new RegExp(name) });
  }

  static nodeCell(name) {
    return cy.contains('tbody td', name, { timeout: 10000 });
  }

  static nodeActionsButton(name) {
    return CustomNodesPage.nodeRow(name).findByRole('button', { name: 'More Actions' });
  }

  static nodeEditAction(name) {
    CustomNodesPage.nodeActionsButton(name).click();
    return cy.findByRole('menuitem', { name: 'Edit' });
  }

  static nodeDeleteAction(name) {
    CustomNodesPage.nodeActionsButton(name).click();
    return cy.findByRole('menuitem', { name: 'Delete' });
  }

  static nodeExportAction(name) {
    CustomNodesPage.nodeActionsButton(name).click();
    return cy.findByRole('menuitem', { name: 'Export' });
  }

  static nodeInstancesBadge(name) {
    return CustomNodesPage.nodeRow(name).find('.badge');
  }

  // ── Modals ────────────────────────────────────────────────────────────────

  static get importModal() {
    return cy.get('#importModal');
  }

  static get importFileInput() {
    return CustomNodesPage.importModal.find('input[type="file"]');
  }

  static get importConfirmButton() {
    return CustomNodesPage.importModal.findByRole('button', { name: /^Import/ });
  }

  static get importDoneButton() {
    return CustomNodesPage.importModal.findByRole('button', { name: 'Done' });
  }

  static get viewConfigurationButton() {
    return CustomNodesPage.importModal.findByRole('button', { name: 'View node configuration' });
  }

  static get cannotDeleteModal() {
    return cy.get('#cannotDeleteModal');
  }

  static get cannotDeleteDoneButton() {
    return CustomNodesPage.cannotDeleteModal.findByRole('button', { name: 'Done' });
  }

  static get deleteModal() {
    return cy.get('#deleteModal');
  }

  static get deleteConfirmButton() {
    return CustomNodesPage.deleteModal.findByRole('button', { name: 'Delete' });
  }
}
