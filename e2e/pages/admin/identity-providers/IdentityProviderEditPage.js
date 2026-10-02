/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class IdentityProviderEditPage extends BaseAdminPage {
  /**
   * Opens the edit view for the given provider.
   * @param {string} providerId - provider id
   * @param {string} providerType - provider config type, e.g. 'oidcConfig'
   */
  static visit(providerId, providerType = 'oidcConfig') {
    const editUrl = Cypress.env('IS_FRAAS')
      ? `/platform/?realm=alpha#/idps/${providerType}/${providerId}`
      : `/platform/#/idps/${providerType}/${providerId}`;
    cy.intercept('GET', `**/services/SocialIdentityProviders/${providerType}/${providerId}`).as('idpGet');
    cy.visit(editUrl);
    cy.wait('@idpGet', { timeout: 15000 });
  }

  // ── Header ────────────────────────────────────────────────────────────────────

  static get providerNameHeading() {
    return cy.findByRole('heading', { name: /social identity provider/i });
  }

  /**
   * The state toggle button (FrSchemaStateButton). Shows the current state
   * ("Active"/"Inactive") with an icon. No testid — located by accessible name.
   * @param {('Active'|'Inactive')} stateName - current displayed state
   */
  static stateButton(stateName) {
    return cy.findByRole('button', { name: stateName });
  }

  /**
   * Opens the state dropdown and clicks the target state menu item.
   * @param {('Active'|'Inactive')} currentState - state shown on the toggle button
   * @param {('Active'|'Inactive')} targetState - state to select from the dropdown
   */
  static toggleState(currentState, targetState) {
    IdentityProviderEditPage.stateButton(currentState).click();
    cy.findByRole('menuitem', { name: targetState }).click();
  }
}
