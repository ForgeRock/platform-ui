/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class RemoteConsentServicePage extends BaseAdminPage {
  static visit() {
    const url = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/remote-consent-service' : '/platform/#/remote-consent-service';
    cy.visit(url);
  }

  static get enableServiceButton() {
    return cy.findByRole('button', { name: 'Enable Remote Consent Service' });
  }

  static get settingsHeading() {
    return cy.findByRole('heading', { name: 'Settings', level: 2 });
  }

  static get saveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }

  static get deletePanel() {
    return cy.findByTestId('delete-panel');
  }

  static get deleteServiceButton() {
    return RemoteConsentServicePage.deletePanel.findByRole('button', { name: 'Delete Remote Consent Service' });
  }

  static get deleteDialog() {
    return cy.findByRole('dialog', { name: 'Delete Remote Consent Service?' });
  }

  static get confirmDeleteButton() {
    return RemoteConsentServicePage.deleteDialog.findByRole('button', { name: 'Delete' });
  }

  static get clientNameInput() {
    return cy.get('[data-testid="fr-field-clientId"] [name="clientId"]');
  }
}
