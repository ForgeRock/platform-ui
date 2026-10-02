/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class IdentityProvidersListPage extends BaseAdminPage {
  static get idpsUrl() {
    return Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/idps' : '/platform/#/idps';
  }

  static visit() {
    cy.intercept('POST', '**/services/SocialIdentityProviders?_action=nextdescendents').as('idpNextdescendents');
    cy.visit(IdentityProvidersListPage.idpsUrl);
    cy.wait('@idpNextdescendents', { timeout: 15000 });
  }

  // ── Page header ───────────────────────────────────────────────────────────────

  static get pageHeading() {
    return cy.findByRole('heading', { name: 'Identity Providers', level: 1 });
  }

  // ── Table ─────────────────────────────────────────────────────────────────────

  /**
   * Row of the provider with the given id. The name cell heading holds the provider
   * name (falls back to the id when no name attribute was set on the provider).
   * @param {string} providerId - provider id or name shown in the name cell
   */
  static providerRow(providerId) {
    return IdentityProvidersListPage.pageTable
      .findAllByRole('row')
      .filter((_, row) => row.textContent.includes(providerId))
      .first();
  }

  // ── Delete modal ──────────────────────────────────────────────────────────────

  static get deleteModalHeading() {
    return cy.findByRole('heading', { name: /delete identity provider\?/i });
  }

  static get deleteConfirmButton() {
    return cy.get('#deleteModal').findByRole('button', { name: /^delete$/i });
  }
}
