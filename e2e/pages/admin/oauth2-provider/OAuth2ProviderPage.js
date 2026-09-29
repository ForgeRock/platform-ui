/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class OAuth2ProviderPage extends BaseAdminPage {
  static visit() {
    const url = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/oauth2-provider' : '/platform/#/oauth2-provider';
    cy.visit(url);
  }

  static get heading() {
    return cy.findByRole('heading', { name: 'OAuth2 Provider' });
  }

  static get coreTab() {
    return cy.findByRole('tab', { name: 'Core' });
  }

  static get issueRefreshTokenToggle() {
    return cy.get('[data-testid="fr-field-issueRefreshToken"] [name="issueRefreshToken"]');
  }

  static get saveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }

  static get scriptedJwtIssuersTab() {
    return cy.findByRole('tab', { name: 'Scripted JWT Issuers' });
  }

  static get newScriptedJwtIssuerButton() {
    return cy.findByRole('button', { name: 'New Scripted JWT Issuer' });
  }

  static get scriptedJwtIssuerModal() {
    return cy.findByRole('dialog', { name: 'New Scripted JWT Issuer' });
  }

  static get scriptedJwtIssuerNameInput() {
    return OAuth2ProviderPage.scriptedJwtIssuerModal.findByRole('textbox', { name: 'Name' });
  }

  static get scriptedJwtIssuerSaveButton() {
    return OAuth2ProviderPage.scriptedJwtIssuerModal.findByRole('button', { name: 'Save' });
  }

  static scriptedJwtIssuerRow(issuerName) {
    return cy.findByRole('row', { name: new RegExp(issuerName) });
  }

  static scriptedJwtIssuerActions(issuerName) {
    return OAuth2ProviderPage.scriptedJwtIssuerRow(issuerName).find('button[aria-haspopup="true"]');
  }

  static scriptedJwtIssuerDeleteAction() {
    return cy.findByRole('menuitem', { name: 'Delete' });
  }

  static get scriptedJwtIssuerDeleteDialog() {
    return cy.findByRole('dialog', { name: 'Delete Scripted JWT Issuer?' });
  }

  static get scriptedJwtIssuerDeleteConfirmButton() {
    return OAuth2ProviderPage.scriptedJwtIssuerDeleteDialog.findByRole('button', { name: 'Delete' });
  }
}
