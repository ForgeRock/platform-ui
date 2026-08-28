/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class CreateEditCustomNodePage extends BaseAdminPage {
  // ── Wizard chrome ─────────────────────────────────────────────────────────

  static get wizardTitle() {
    return cy.findByTestId('wizard-title');
  }

  static get nextButton() {
    return cy.findByTestId('nextButton');
  }

  static get saveButton() {
    return cy.findByTestId('saveButton');
  }

  static wizardTab(tabName) {
    return cy.findByRole('tab', { name: tabName });
  }

  // ── Details tab ───────────────────────────────────────────────────────────

  static get nameField() {
    return cy.findByLabelText('Name');
  }

  static get descriptionField() {
    return cy.findByLabelText('Description (optional)');
  }

  // ── Script tab ────────────────────────────────────────────────────────────

  static get scriptEditor() {
    return cy.get('.cm-content');
  }

  static get bindingsPanelButton() {
    return cy.get('#bindings');
  }

  static get bindingsHeading() {
    return cy.findByRole('heading', { name: 'Bindings' });
  }

  static get esvsPanelButton() {
    return cy.get('#esvs');
  }

  static get bindingsList() {
    return cy.get('.side-panel .list-group');
  }

  static bindingItem(bindingName) {
    return CreateEditCustomNodePage.bindingsList.find('.list-group-item').contains(bindingName);
  }

  static get bindingLoadingSpinner() {
    return cy.findByTestId('binding-loading-spinner');
  }

  // ── Edit-mode actions cell ────────────────────────────────────────────────

  static nodeActionsButton() {
    return cy.findByRole('button', { name: 'More Actions' });
  }

  // ── Overview tab (edit mode) ──────────────────────────────────────────────

  static get journeysCount() {
    return cy.findByTestId('journeys-count');
  }

  static get instancesCount() {
    return cy.findByTestId('instances-count');
  }

  static journeyRowInOverview(journeyName) {
    return cy.findByRole('row', { name: new RegExp(journeyName) });
  }

  // ── Modals ────────────────────────────────────────────────────────────────

  static get cannotDeleteModal() {
    return cy.get('#cannotDeleteModal');
  }

  static get cannotDeleteDoneButton() {
    return CreateEditCustomNodePage.cannotDeleteModal.findByRole('button', { name: 'Done' });
  }

  static get deleteModal() {
    return cy.get('#deleteModal');
  }

  static get deleteConfirmButton() {
    return CreateEditCustomNodePage.deleteModal.findByRole('button', { name: 'Delete' });
  }
}
