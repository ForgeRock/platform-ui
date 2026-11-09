/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const RECON_JOB_TYPES = {
  full: 'Full Reconciliation',
  incremental: 'Incremental Reconciliation',
};

export default class ProvisioningTabPage {
  static get provisioningTab() {
    return cy.findByRole('tab', { name: 'Provisioning' }, { timeout: 15000 });
  }

  static get setUpProvisioningButton() {
    return cy.findByRole('button', { name: /set up provisioning/i }, { timeout: 15000 });
  }

  // ── Connect dialog ───────────────────────────────────────────────────────────

  static get connectDialog() {
    return cy.get('#FrGenericConnectorModal', { timeout: 15000 });
  }

  static connectField(label) {
    // Each type can re-render the form (async field validation), detaching earlier
    // queries — resolve the input fresh inside the type call chain.
    return ProvisioningTabPage.connectDialog
      .should('be.visible')
      .get(`[data-testid="fr-field-${label}"] input`)
      .should('exist');
  }

  static get connectButton() {
    return ProvisioningTabPage.connectDialog.findByRole('button', { name: /^connect$/i });
  }

  // ── Connection state ─────────────────────────────────────────────────────────

  static get connectedBadge() {
    return cy.findByText(/^connected$/i, { timeout: 30000 });
  }

  static get provisionerLinkedAlert() {
    return cy.findByText(/provisioner successfully linked to application/i, { timeout: 30000 });
  }

  static get mappingsCreatedAlert() {
    return cy.findByText(/application mappings successfully created/i, { timeout: 30000 });
  }

  // ── Object-type editor side navigation (shown after connect at .../Provisioning/User/Details) ──
  // MenuItem renders nav groups as BButtons with role=null (isNav), and sub-items as
  // bare anchors without href (no implicit link role) — hence text/click queries.

  static get reconciliationNavGroup() {
    return cy.get('.fr-simple-nav').contains('button', 'Reconciliation', { timeout: 15000 });
  }

  static get settingsNavItem() {
    return cy.get('.fr-simple-nav .fr-menu-item-submenuitems').contains('a', 'Settings');
  }

  // ── Schedule Jobs table ──────────────────────────────────────────────────────

  static get scheduleJobsHeading() {
    return cy.findByRole('heading', { name: /schedule jobs/i });
  }

  static scheduleJobTypeCell(type) {
    return cy.findByText(RECON_JOB_TYPES[type], { timeout: 15000 });
  }

  static scheduleJobRow(type) {
    return ProvisioningTabPage.scheduleJobTypeCell(type).closest('tr');
  }

  static scheduleJobSetUpEditButton(type, buttonName) {
    return ProvisioningTabPage.scheduleJobRow(type).findByRole('button', { name: buttonName });
  }

  static scheduleJobStatusCell(type) {
    return ProvisioningTabPage.scheduleJobRow(type).findByRole('cell', { name: /active|inactive/i });
  }

  // ── Schedule (Full/Incremental) Reconciliation Job modal ─────────────────────

  static scheduleReconJobModalTitle(type) {
    return cy.findByRole('heading', { name: `Schedule ${RECON_JOB_TYPES[type]} Job` }, { timeout: 15000 });
  }

  static get scheduleReconJobModal() {
    return cy.get('#scheduleEditorModal', { timeout: 15000 });
  }

  static get runEveryInput() {
    return ProvisioningTabPage.scheduleReconJobModal.get('[data-testid="fr-field-runInterval"] input');
  }

  static get repeatCountInput() {
    return ProvisioningTabPage.scheduleReconJobModal.get('[data-testid="fr-field-repeatCount"] input');
  }

  static get saveButton() {
    return ProvisioningTabPage.scheduleReconJobModal.findByRole('button', { name: 'Save' });
  }

  // ── Save feedback ────────────────────────────────────────────────────────────

  static get scheduleSuccessAlert() {
    // Layout renders vue3-notification toasts as FrAlerts, auto-dismissed after 4s
    return cy.get('[data-testid="FrAlert"]', { timeout: 10000 }).contains('Scheduled job set successfully');
  }

  static scheduleJobNextRunCell(type) {
    // The next run renders inside the Type cell as a muted "Next run: <date>" line
    return ProvisioningTabPage.scheduleJobRow(type).contains(/next run:/i);
  }
}
