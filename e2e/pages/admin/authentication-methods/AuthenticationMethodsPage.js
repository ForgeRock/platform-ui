/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import BaseAdminPage from '../BaseAdminPage';

export default class AuthenticationMethodsPage extends BaseAdminPage {
  static visit() {
    const url = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/authentication-methods' : '/platform/#/authentication-methods';
    cy.visit(url);
  }

  static get heading() {
    return cy.findByRole('heading', { name: 'Authentication Methods', level: 1 });
  }

  static get backLink() {
    return cy.findByRole('link', { name: 'Back to Authentication Methods' });
  }

  static method(name) {
    const accessibleName = name instanceof RegExp
      ? name
      : new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return cy.findByRole('button', { name: accessibleName });
  }

  static status(name, status) {
    return AuthenticationMethodsPage.method(name).findByText(status, { exact: true });
  }

  static enableServiceButton(name) {
    return cy.findByRole('button', { name: `Enable ${name}` });
  }

  static get settingsHeading() {
    return cy.findByRole('heading', { name: 'Settings', level: 2 });
  }

  static deleteServiceButton(name) {
    return cy.findByRole('button', { name: `Delete ${name}` });
  }

  static deleteServiceModal(name) {
    return cy.findByRole('dialog', { name: `Delete ${name}?` });
  }

  static confirmDeleteServiceButton(name) {
    return AuthenticationMethodsPage.deleteServiceModal(name).findByRole('button', { name: 'Delete' });
  }
}
