/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
const hostedPagesUrl = `${Cypress.config().baseUrl}/platform/?realm=${realm}#/hosted-pages`;

export default class HostedPagesPage {
  static get heading() {
    return cy.findByRole('heading', { name: 'Hosted Pages', timeout: 10000 });
  }

  static navigateToHostedPages() {
    cy.intercept('GET', '/openidm/ui/theme/**').as('getThemes');
    cy.visit(hostedPagesUrl);
    cy.wait('@getThemes', { timeout: 10000 });
    HostedPagesPage.heading.should('be.visible');
  }

  static assertThemeExists(themeName) {
    cy.findByRole('searchbox', { name: 'Search' }).clear().type(themeName);
    cy.findByRole('cell', { name: themeName }).should('be.visible');
  }
}
