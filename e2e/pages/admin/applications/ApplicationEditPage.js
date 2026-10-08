/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export const TOKEN_LIFETIME_FIELDS = {
  authorizationCode: 'Authorization code lifetime (seconds)',
  accessToken: 'Access token lifetime (seconds)',
  refreshToken: 'Refresh token lifetime (seconds)',
  jwtToken: 'JWT token lifetime (seconds)',
};

export default class ApplicationEditPage {
  static visit(applicationId, applicationType = 'native') {
    const url = Cypress.env('IS_FRAAS')
      ? `/platform/?realm=alpha#/applications/edit/${applicationType}/workforce/${applicationId}/applicationDetails`
      : `/platform/#/applications/edit/${applicationType}/workforce/${applicationId}/applicationDetails`;
    cy.visit(url);
  }

  // "Native / SPA" heading — only rendered once the app record and schema have loaded
  static get editPageHeading() {
    return cy.findByRole('heading', { name: /native \/ spa/i }, { timeout: 15000 });
  }

  // The SAML template's display name rendered as the header subtitle — only
  // rendered once the app record and schema have loaded
  static get editPageSamlHeading() {
    return cy.findByRole('heading', { name: /^saml$/i }, { timeout: 15000 });
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────────

  static get signOnTab() {
    return cy.findByRole('tab', { name: 'Sign On' }, { timeout: 15000 });
  }

  static get tokenLifetimesTab() {
    return cy.findByRole('tab', { name: 'Token Lifetimes' }, { timeout: 15000 });
  }

  // There are two "Show advanced settings" links (Client Credentials card and
  // General Settings card) — the Token Lifetimes panel lives under #generalPanel
  static get showAdvancedSettingsLink() {
    return cy.get('#generalPanel').findByRole('link', { name: /show advanced settings/i });
  }

  // ── Token Lifetimes fields ───────────────────────────────────────────────────

  static tokenLifetimeField(label) {
    return cy.findByLabelText(label);
  }

  // ── Details tab ──────────────────────────────────────────────────────────────

  static get detailsNameField() {
    // Lazy-loaded tab: generous timeout while the app record, schema and tab
    // content finish loading
    return cy.get('#applicationDetails').findByLabelText('Name', { timeout: 15000 });
  }

  // ── Owners (Details tab) ─────────────────────────────────────────────────────

  static ownerChip(ownerUsername) {
    return cy.get('#applicationDetails').contains('.multiselect__tag', ownerUsername);
  }

  static ownerChipRemoveButton(ownerUsername) {
    return ApplicationEditPage.ownerChip(ownerUsername).findByRole('button', { name: 'Remove' });
  }

  // ── Delete panel (Details tab bottom) ────────────────────────────────────────

  static get deletePanel() {
    return cy.get('[data-testid="delete-panel"]');
  }

  static get deleteApplicationButton() {
    return ApplicationEditPage.deletePanel.findByRole('button', { name: /delete application/i });
  }

  static get deleteConfirmDialog() {
    return cy.findByRole('dialog', { name: /delete application\?/i });
  }

  static get deleteConfirmButton() {
    return ApplicationEditPage.deleteConfirmDialog.findByRole('button', { name: /^delete$/i });
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  static get saveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }

  // Status toggle above the tabs — button text matches the current status
  // ("Active" or "Inactive"); only rendered for Consumer (OIDC) templates
  static get statusButton() {
    return cy.findByRole('button', { name: /active|inactive/i });
  }

  static statusOption(status) {
    return cy.findByRole('menuitem', { name: new RegExp(status, 'i') });
  }
}
