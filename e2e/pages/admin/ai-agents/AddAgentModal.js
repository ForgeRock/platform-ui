/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Page Object Model for the "Add new AI Agent" modal.
 * Selectors only — assertions belong in step classes or it blocks.
 */
export default class AddAgentModal {
  static get dialog() {
    return cy.findByRole('dialog', { name: /add new ai agent/i });
  }

  // FrField renders <label :for> pointing at the input id, so the input is
  // reachable by its visible label.
  static get nameInput() {
    return AddAgentModal.dialog.findByLabelText('Name');
  }

  static get clientIdInput() {
    return AddAgentModal.dialog.findByLabelText('Client ID');
  }

  static get saveButton() {
    return AddAgentModal.dialog.findByRole('button', { name: /^save$/i });
  }
}
