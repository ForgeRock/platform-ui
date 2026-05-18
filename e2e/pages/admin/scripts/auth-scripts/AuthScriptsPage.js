/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class AuthScriptsPage {
  static get heading() {
    return cy.findByRole('heading', { name: 'Scripts' });
  }

  static get newScriptButton() {
    return cy.findByRole('button', { name: 'New Script' });
  }

  static get searchInput() {
    return cy.findByRole('searchbox', { name: 'Search' });
  }
}
