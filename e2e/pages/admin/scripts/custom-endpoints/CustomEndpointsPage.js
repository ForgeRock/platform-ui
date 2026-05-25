/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class CustomEndpointsPage {
  static visit() {
    const url = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/customEndpoints' : '/platform/#/customEndpoints';

    cy.visit(url);
    // The SPA may skip the API call on re-visits (store already populated), so an
    // intercept is unreliable. The 500ms pause gives the spinner time to appear
    // before we assert it's gone — ensuring the loading cycle completes before proceeding.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.get('[role="status"]', { timeout: 30000 }).should('not.exist');
    CustomEndpointsPage.newEndpointButton.should('be.visible');
  }

  static get newEndpointButton() {
    return cy.findByRole('button', { name: /new endpoint/i, timeout: 30000 });
  }

  static get table() {
    return cy.findByRole('table');
  }

  static endpointRow(endpointName) {
    return CustomEndpointsPage.table
      .findByRole('cell', { name: endpointName })
      .closest('tr');
  }
}
