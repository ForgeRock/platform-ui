/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';

export default class HostedPagesEditPage {
  static editUrl(themeName) {
    return `${Cypress.config().baseUrl}/platform/?realm=${realm}#/hosted-pages/${encodeURIComponent(themeName)}`;
  }

  /**
   * Opens the edit screen for the given theme directly by URL. The route's
   * themeName param is the theme's display name (see the HostedPagesEdit route).
   * An unconditional reload follows the visit: when the SPA is already on a
   * /hosted-pages URL, cy.visit differs only by hash (or not at all), so it
   * does not remount the app and the navigation can be dropped entirely —
   * same hardening as ManageIdentitiesSteps.visitManagePage (IAM-11993).
   */
  static visit(themeName) {
    cy.intercept('GET', '/openidm/ui/theme/**').as('getThemes');
    cy.visit(HostedPagesEditPage.editUrl(themeName));
    cy.wait('@getThemes', { timeout: 10000 });
    cy.findByRole('heading', { name: themeName, timeout: 10000 }).should('be.visible');
    cy.reload();
    cy.wait('@getThemes', { timeout: 10000 });
    cy.findByRole('heading', { name: themeName, timeout: 10000 }).should('be.visible');
  }

  static get globalTab() {
    return cy.findByRole('tab', { name: 'Global' });
  }

  static get journeyPagesTab() {
    return cy.findByRole('tab', { name: 'Journey Pages' });
  }

  static get accountPagesTab() {
    return cy.findByRole('tab', { name: 'Account Pages' });
  }

  /**
   * Inner tabs (Styles, Logo, Layout, Settings, Favicon). A plain role query
   * is safe despite the same names existing in both top-level panels: the
   * inactive panel is display:none and testing-library excludes hidden
   * elements (same approach as the legacy theme-steps.js).
   */
  static innerTab(name) {
    return cy.findByRole('tab', { name });
  }

  static get saveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }

  static logoPreview(testid) {
    return cy.findByTestId(testid).closest('[role="button"]');
  }

  /**
   * Clicks the edit (pencil) affordance on a logo preview card. The card is an
   * <a role="button"> whose footer carries the FrIcon edit icon.
   */
  static clickLogoPreviewEdit(testid) {
    HostedPagesEditPage.logoPreview(testid).find('.material-icons-outlined').click();
  }
}
