/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class AssertionServersPage extends BaseAdminPage {
  static visit() {
    const url = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/assertion-servers' : '/platform/#/assertion-servers';
    cy.visit(url);
  }

  // ── Service enable state ─────────────────────────────────────────────────────

  static get enableServiceButton() {
    return cy.findByRole('button', { name: 'Enable Assertion Servers' });
  }

  static get assertionServersTab() {
    return cy.findByRole('tab', { name: 'Assertion Servers' });
  }

  static get settingsTab() {
    return cy.findByRole('tab', { name: 'Settings' });
  }

  // ── Toolbar ──────────────────────────────────────────────────────────────────

  static get newAssertionServerButton() {
    return cy.findByRole('button', { name: /^assertion server$/i });
  }

  // ── Table ────────────────────────────────────────────────────────────────────

  static serverRow(serverName) {
    return cy.contains('tr', serverName);
  }

  // ── Create / edit modal ──────────────────────────────────────────────────────

  static get addModal() {
    return cy.findByRole('dialog', { name: 'Add Assertion Server' });
  }

  static get editModal() {
    return cy.findByRole('dialog', { name: 'Edit Assertion Server' });
  }

  static get newNameInput() {
    return cy.findByRole('textbox', { name: 'Assertion Server Name' });
  }

  /**
   * Finds a generated-form field by its accessible label (the schema `title`).
   * @param {string} label - Accessible name of the field's label, e.g. 'Server URL'.
   */
  static modalField(label) {
    return cy.findByRole('textbox', { name: label });
  }

  static get modalCreateButton() {
    return cy.findByRole('dialog').findByRole('button', { name: 'Create' });
  }

  static get modalSaveChangesButton() {
    return cy.findByRole('dialog').findByRole('button', { name: 'Save Changes' });
  }

  static get modalCancelButton() {
    return cy.findByRole('dialog').findByRole('button', { name: 'Cancel' });
  }

  // ── Delete modal ─────────────────────────────────────────────────────────────

  static get deleteDialog() {
    return cy.findByRole('dialog', { name: 'Delete Assertion Server?' });
  }

  static get confirmDeleteButton() {
    return AssertionServersPage.deleteDialog.findByRole('button', { name: 'Delete' });
  }
}
