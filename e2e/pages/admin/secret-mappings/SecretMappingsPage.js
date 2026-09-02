/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class SecretMappingsPage {
  static get secretsAndKeysNavigation() {
    return cy.findByRole('button', { name: /secrets & keys/i });
  }

  static get secretMappingsNavigation() {
    return cy.findByRole('link', { name: /^secret mappings$/i });
  }

  static get pageTitle() {
    return cy.findByRole('heading', { name: /^secret mappings$/i });
  }

  static get searchInput() {
    return cy.findByRole('searchbox', { name: /search/i });
  }

  static groupButton(groupName) {
    return cy.findByRole('button', { name: new RegExp(groupName, 'i') });
  }

  static secretLabelRow(secretLabel) {
    return cy.contains('tr', secretLabel);
  }

  static formattedSecretLabel(secretLabel) {
    return SecretMappingsPage.secretLabelRow(secretLabel).find('code').contains(secretLabel);
  }

  static assignmentButton(secretLabel) {
    return SecretMappingsPage.secretLabelRow(secretLabel).findByRole('button', { name: /assign secret/i });
  }

  static environmentSecretCell(secretLabel) {
    return SecretMappingsPage.secretLabelRow(secretLabel).find('td').eq(2);
  }

  static mappingStatusCell(secretLabel) {
    return SecretMappingsPage.secretLabelRow(secretLabel).find('td').eq(1);
  }

  static actionsButton(secretLabel) {
    return SecretMappingsPage.secretLabelRow(secretLabel).find(`[data-testid="actions-${secretLabel}"] button`);
  }

  static assignmentModal() {
    return cy.get('#secret-mapping-modal');
  }

  static environmentSecretSelect() {
    return cy.findByRole('combobox', { name: /environment secret/i });
  }
}
