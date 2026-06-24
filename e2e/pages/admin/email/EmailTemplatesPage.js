/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
const emailTemplatesUrl = `${Cypress.config().baseUrl}/platform/?realm=${realm}#/email/templates`;

export default class EmailTemplatesPage {
  static get heading() {
    return cy.findByRole('heading', { name: 'Email Templates', timeout: 10000 });
  }

  static navigateToEmailTemplates() {
    // The list endpoint is `GET /openidm/config?_queryFilter=...`, but Cypress glob
    // treats `?` as a single-char wildcard, which never matches the literal `?` in
    // the URL. Use a regex matcher so the alias is reliable.
    cy.intercept('GET', /\/openidm\/config\?_queryFilter=/).as('getEmailTemplates');
    cy.visit(emailTemplatesUrl);
    cy.wait('@getEmailTemplates', { timeout: 10000 });
    EmailTemplatesPage.heading.should('be.visible');
  }

  static assertEmailTemplateExists(displayName) {
    cy.findByRole('cell', { name: displayName }).should('be.visible');
  }
}
