/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class Oauth2ClientEditPage {
  static visit(clientId) {
    const url = Cypress.env('IS_FRAAS')
      ? `/platform/?realm=alpha#/applications/edit/service/legacy/${clientId}/applicationDetails`
      : `/platform/#/applications/edit/service/legacy/${clientId}/applicationDetails`;
    cy.visit(url);
  }

  // ── Navigation ────────────────────────────────────────────────────────────────

  static get backLink() {
    return cy.findByRole('link', { name: /back to oauth2 clients/i });
  }

  // ── Form Fields ───────────────────────────────────────────────────────────────

  static get nameInput() {
    return cy.findByRole('textbox', { name: /name/i });
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  static get saveButton() {
    return cy.findByRole('button', { name: /save/i });
  }

  // Status toggle — button text matches the current status ("Active" or "Inactive")
  static get statusButton() {
    return cy.findByRole('button', { name: /active|inactive/i });
  }

  static statusOption(status) {
    return cy.findByRole('menuitem', { name: new RegExp(status, 'i') });
  }
}
