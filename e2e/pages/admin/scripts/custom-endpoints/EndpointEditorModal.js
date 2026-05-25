/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class EndpointEditorModal {
  static get modal() {
    return cy.findByRole('dialog');
  }

  static get nameInput() {
    return EndpointEditorModal.modal.findByRole('textbox', { name: /^name$/i });
  }

  static get descriptionInput() {
    return EndpointEditorModal.modal.findByRole('textbox', { name: /description/i });
  }

  static get fullscreenButton() {
    return EndpointEditorModal.modal.findByRole('button', { name: /fullscreen/i });
  }

  // The curl panel icon button — identified by the button id #btnShowCurlPanel
  static get curlPanelIcon() {
    return cy.get('#btnShowCurlPanel');
  }

  static get curlPanelHeading() {
    return cy.findByRole('heading', { name: /cURL Request/i });
  }

  // The method dropdown toggle inside #requestMethods
  static get methodDropdownButton() {
    return cy.get('#requestMethods button');
  }

  static methodOption(method) {
    return cy.findByRole('menuitem', { name: method });
  }

  // requestBody textarea — identified by its name attribute (no accessible label in the template)
  static get requestBodyTextarea() {
    return cy.get('textarea[name="requestBody"]');
  }

  static get generateButton() {
    return cy.findByRole('button', { name: /generate/i });
  }

  // The curl results panel shown after Generate is clicked
  static get curlResultsPanel() {
    return cy.get('#curlPanel');
  }

  // The close button on the curl results panel (id="curlCloseButton")
  static get curlPanelCloseButton() {
    return cy.get('#curlCloseButton');
  }

  static get saveAndCloseButton() {
    return EndpointEditorModal.modal.findByRole('button', { name: /save and close/i });
  }

  static get saveButton() {
    return EndpointEditorModal.modal.findByRole('button', { name: /^save$/i });
  }

  static get cancelButton() {
    return EndpointEditorModal.modal.findByRole('button', { name: /^cancel$/i });
  }
}
