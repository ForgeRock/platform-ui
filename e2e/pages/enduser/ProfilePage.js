/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseEnduserPage from './BaseEnduserPage';

export default class ProfilePage extends BaseEnduserPage {
  static visit() {
    const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
    cy.visit(`${Cypress.config().baseUrl}/enduser/?realm=${realm}#/profile`);
    ProfilePage.editPersonalInfoButton.should('be.visible');
  }

  // ── Profile card ──────────────────────────────────────────────────────────────

  static get editPersonalInfoButton() {
    return cy.findByRole('button', { name: /edit personal info/i });
  }

  static get displayName() {
    return cy.findByRole('heading', { level: 1 });
  }

  // ── Sign-in & Security section ────────────────────────────────────────────────

  static get usernameDisplay() {
    return cy.findByRole('heading', { name: /^username$/i }).next();
  }
}
