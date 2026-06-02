/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class NextGenScriptEditorModal {
  static get modal() {
    return cy.findByRole('dialog', { timeout: 10000 });
  }

  static get modalHeader() {
    return NextGenScriptEditorModal.modal.findByRole('heading');
  }

  static get nameInput() {
    return cy.findByRole('textbox', { name: 'Name' });
  }

  // menuOption: 'libraries' | 'bindings' | 'esvs' (cloud only) | 'documents'
  static sideMenuOption(menuOption) {
    return cy.get(`#${menuOption}`);
  }

  static get saveAndCloseButton() {
    return cy.findByRole('button', { name: 'Save and Close' });
  }

  static get sidePanel() {
    return cy.get('.side-panel', { timeout: 10000 });
  }

  static get sidePanelHeading() {
    return NextGenScriptEditorModal.sidePanel.findByRole('heading');
  }

  static get sidePanelSearchInput() {
    return NextGenScriptEditorModal.sidePanel.findByRole('searchbox', { name: 'Search' });
  }

  static get searchClearButton() {
    return NextGenScriptEditorModal.sidePanel.findByRole('button', { name: 'Clear' });
  }

  static get bindingsGroupItems() {
    return NextGenScriptEditorModal.sidePanel.find('.list-group-flush');
  }

  // For bindings panel — group headers render as <button> elements
  static bindingsGroupItem(name) {
    return NextGenScriptEditorModal.sidePanel.find('.list-group-flush:has(.collapse) > button').contains(name);
  }

  static get libraryGroupItems() {
    return NextGenScriptEditorModal.sidePanel.find('.library-title');
  }

  static libraryGroupItem(name) {
    return NextGenScriptEditorModal.libraryGroupItems.contains(name);
  }

  static sidePanelItem(name) {
    return NextGenScriptEditorModal.sidePanel.find('.collapse.show .list-group-item').contains(name);
  }

  static get expandedSidePanelItems() {
    return NextGenScriptEditorModal.sidePanel.find('.collapse.show .list-group-item');
  }
}
