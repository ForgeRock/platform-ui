/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class NewScriptModal {
  static get newScriptModal() {
    return cy.findByRole('dialog', { name: 'New Script' });
  }

  // categoryName: 'Journeys' | 'OAuth2 / OIDC' | 'SAML' | 'Other'
  static scriptCategory(categoryName) {
    return cy.findByRole('tab', { name: categoryName });
  }

  // typeName: e.g. 'Journey Decision Node', 'Configuration Provider Node'
  static scriptType(typeName) {
    return cy.findByRole('radio', { name: new RegExp(`^${typeName}`) });
  }

  static get engineModal() {
    return cy.findByRole('dialog', { name: 'Choose Script Engine' });
  }

  // engineName: 'Legacy' | 'Next Generation'
  static scriptEngineType(engineName) {
    return cy.findByRole('radio', { name: new RegExp(`^${engineName}`) });
  }

  static get nextButton() {
    return cy.findByRole('button', { name: 'Next' });
  }

  static get previousButton() {
    return cy.findByRole('button', { name: 'Previous' });
  }

  static get cancelButton() {
    return cy.findByRole('button', { name: 'Cancel' });
  }
}
