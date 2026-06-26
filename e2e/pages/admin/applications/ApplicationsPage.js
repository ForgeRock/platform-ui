/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class ApplicationsPage {
  static visit() {
    const url = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/applications' : '/platform/#/applications';
    cy.visit(url);
  }

  static get heading() {
    return cy.findByRole('heading', { name: /^applications$/i });
  }

  static get customApplicationButton() {
    return cy.findByRole('button', { name: /custom application/i });
  }

  static get browseAppCatalogButton() {
    return cy.findByRole('button', { name: /browse app catalog/i });
  }

  static get table() {
    return cy.findByRole('table');
  }

  static applicationRow(appName) {
    return ApplicationsPage.table.contains('tr', appName);
  }

  static applicationRowStatus(appName) {
    return ApplicationsPage.applicationRow(appName).findByRole('cell', { name: /active|inactive/i });
  }
}
