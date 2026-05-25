/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class AdminDetailPage {
  // ── Header ────────────────────────────────────────────────────────────────────

  static get adminName() {
    return cy.findByRole('heading', { level: 1 });
  }

  static get adminEmail() {
    return cy.get('span.text-monospace');
  }

  static get statusButton() {
    return cy.findByRole('button', { name: /active|inactive|invited/i });
  }

  static get backLink() {
    return cy.findByRole('link', { name: /tenant settings/i });
  }

  // ── Profile fields ────────────────────────────────────────────────────────────

  static get firstNameField() {
    return cy.findByText(/first name/i).next('p');
  }

  static get lastNameField() {
    return cy.findByText(/last name/i).next('p');
  }

  static get emailField() {
    return cy.findByText(/email address/i).next('p');
  }

  static get groupsField() {
    return cy.findByText(/group\(s\)/i).closest('li').find('span');
  }
}
