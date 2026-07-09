/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const realm = () => (Cypress.env('IS_FRAAS') ? 'alpha' : 'root');
const realmUrl = () => (Cypress.env('IS_FRAAS') ? '/realms/alpha' : '');

export default class JourneyEditorPage {
  static visit(treeName) {
    JourneyEditorPage.interceptAndAwaitGetJourney(treeName, () => {
      cy.visit(`/platform/?realm=${realm()}#/journeys/${treeName}`);
    });
    JourneyEditorPage.heading(treeName).should('be.visible');
    JourneyEditorPage.canvas.should('be.visible');
  }

  static reload(treeName) {
    // Called mid-test to re-render the editor from the server. `cy.visit()`
    // no-ops when we're already at the same URL, so it must be `cy.reload()`
    // here (mirrors the pattern in `cy.reloadUI()`).
    JourneyEditorPage.interceptAndAwaitGetJourney(treeName, () => {
      cy.reload();
    });
    JourneyEditorPage.heading(treeName).should('be.visible');
    JourneyEditorPage.canvas.should('be.visible');
  }

  static interceptAndAwaitGetJourney(treeName, trigger) {
    // Unique alias per call — Cypress persists the per-alias request counter
    // across re-registrations, which would otherwise break the second
    // `cy.wait` inside a single test.
    const alias = Cypress._.uniqueId('getJourney_');
    cy.intercept(
      'GET',
      `/am/json/realms/root${realmUrl()}/realm-config/authentication/authenticationtrees/trees/${treeName}?forUI=true`,
    ).as(alias);
    trigger();
    cy.wait(`@${alias}`, { timeout: 10000 });
  }

  // ── Header ────────────────────────────────────────────────────────────────

  static heading(treeName) {
    return cy.findByRole('heading', { name: treeName, level: 1 });
  }

  static get previewUrlButton() {
    return cy.findByRole('button', { name: 'Preview URL' });
  }

  static get topNavbar() {
    return cy.findAllByTestId('fr-main-navbar').last();
  }

  // ── Editor canvas & palette ───────────────────────────────────────────────

  static get canvas() {
    return cy.findByTestId('tree-canvas');
  }

  static get nodeList() {
    return cy.findByTestId('tree-node-list');
  }

  static get nodeFilter() {
    return cy.findByRole('searchbox', { name: 'Filter nodes' });
  }

  static get sidebarNode() {
    return cy.findByTestId('sidebar-node');
  }

  // ── Toolbar buttons ───────────────────────────────────────────────────────

  static get autoLayoutButton() {
    return cy.findByRole('button', { name: 'Auto Layout' });
  }

  static get saveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }

  static get toggleFullscreenButton() {
    return cy.findByRole('button', { name: 'Toggle Fullscreen' });
  }

  static get toggleNodeListButton() {
    // Raw attribute selector — findByRole excludes elements whose parents are
    // `display:none`, but this button stays in the DOM after the node list is
    // closed and TC-12019 needs to assert `not.be.visible` on it.
    return cy.get('button[aria-label="Toggle Node List"]');
  }

  static get openNodesButton() {
    return cy.findByRole('button', { name: 'Nodes' });
  }

  // ── Edit panel ────────────────────────────────────────────────────────────

  static get editPanel() {
    return cy.findByTestId('tree-editpanel');
  }

  static get editPanelCloseButton() {
    return JourneyEditorPage.editPanel.findByRole('button', { name: 'Close' });
  }

  static get deleteButton() {
    return cy.findByRole('button', { name: 'Delete' });
  }

  // ── Canvas nodes ──────────────────────────────────────────────────────────

  static get startNode() {
    return cy.get('#start_startNode');
  }

  static get successNode() {
    return cy.findByTestId('single-input-node-success');
  }

  static get failureNode() {
    return cy.findByTestId('single-input-node-error');
  }

  static get outcomePoints() {
    return cy.get('i.fr-node-point-outcome');
  }

  static get connectionPaths() {
    return cy.get('path.accented-connection');
  }

  static allTreeNodes() {
    return cy.findAllByTestId('tree-node');
  }

  static nodeByName(name) {
    return cy.findAllByTestId('tree-node').contains(name);
  }

  static nodeWrapper(name) {
    return JourneyEditorPage.nodeByName(name).parents('.fr-node.vdr');
  }

  // ── Errors ────────────────────────────────────────────────────────────────

  static get errorIndicator() {
    return cy.get('#frErrorIndicator');
  }
}
