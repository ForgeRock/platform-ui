/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class IdentityVerificationPage {
  static get jumioRow() {
    return cy.findByRole('button', { name: /Jumio/ });
  }

  static jumioStatus(status) {
    return IdentityVerificationPage.jumioRow.contains(status);
  }

  static get enableServiceButton() {
    return cy.findByRole('button', { name: /enable jumio/i });
  }

  static get deleteServiceButton() {
    return cy.findByTestId('delete-panel').findByRole('button', { name: /delete jumio/i });
  }
}
