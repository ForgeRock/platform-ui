/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class SelfServiceJourneysPage extends BaseAdminPage {
  static visit() {
    const url = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/selfservice-journeys' : '/platform/#/selfservice-journeys';
    cy.visit(url);
  }

  static get heading() {
    return cy.findByRole('heading', { name: 'Self-service Journeys' });
  }

  static get statusBadge() {
    return cy.findByText(/^(Active|Inactive)$/);
  }

  static get activateButton() {
    return cy.findByRole('button', { name: 'Activate' });
  }

  static get deactivateButton() {
    return cy.findByRole('button', { name: 'Deactivate' });
  }

  static get addMappingButton() {
    return cy.findByRole('button', { name: 'Add mapping' });
  }

  static mappingKeyInput(index) {
    return cy.findAllByLabelText('Key').eq(index);
  }

  static mappingJourneySelect(index) {
    return cy.findAllByLabelText('Journey').eq(index);
  }

  static get saveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }
}
