/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class RealmSettingsPage {
  static visit(realmName) {
    const realmParam = realmName ? `?realm=${realmName}` : '';
    cy.intercept('GET', `/am/json/realms/root/realms/${realmName}/realm-config/authentication`).as('getRealmConfig');
    cy.visit(`/platform/${realmParam}#/realm/details`);
    cy.wait('@getRealmConfig', { timeout: 10000 });
    RealmSettingsPage.heading.should('be.visible');
  }

  static visitServicePage(realmName, servicePath) {
    cy.visit(`/platform/?realm=${realmName}#${servicePath}`);
  }

  // ── Page header ───────────────────────────────────────────────────────────────

  static get heading() {
    return cy.findByRole('heading', { name: 'Realm Settings', level: 1 });
  }

  static get detailsTab() {
    return cy.findByRole('tab', { name: 'Details' });
  }

  static get customDomainTab() {
    return cy.findByRole('tab', { name: 'Custom Domain' });
  }

  // Only rendered when VUE_APP_ENABLE_SERVICES_MIGRATION is enabled
  static get settingsTab() {
    return cy.findByRole('tab', { name: 'Settings' });
  }

  // ── Settings tab (services migration) ────────────────────────────────────────

  static get settingsRows() {
    return cy.get('.card .list-group-item h5');
  }

  static settingsRow(name) {
    // The row button's accessible name includes its status suffix ("Session Off"),
    // so match the row by its exact h5 title instead.
    return cy.get('.card .list-group-item')
      .filter((i, el) => Cypress.$(el).find('h5').text().trim() === name)
      .find('button');
  }

  static servicePageHeading(name) {
    return cy.get('h1').contains(name);
  }

  // Row status (On/Off): the FrIcon root span holds icon name + label text.
  static settingsRowStatus(name) {
    return RealmSettingsPage.settingsRow(name).find('.col-md-6 > span');
  }

  // ── Service page (enable / settings form / delete) ───────────────────────────

  static get serviceEmptyState() {
    return cy.get('.fr-no-data');
  }

  static serviceEnableButton(name) {
    return cy.findByRole('button', { name: `Enable ${name}` });
  }

  static get serviceDeleteCard() {
    return cy.get('[data-testid="delete-panel"]');
  }

  static serviceDeleteButton(name) {
    return RealmSettingsPage.serviceDeleteCard.findByRole('button', { name: `Delete ${name}` });
  }

  static serviceDeleteModal(name) {
    return cy.findByRole('dialog', { name: `Delete ${name}?` });
  }

  static serviceDeleteConfirmButton(name) {
    return RealmSettingsPage.serviceDeleteModal(name).findByRole('button', { name: 'Delete' });
  }

  static get serviceSaveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }

  static get servicePageSpinner() {
    return cy.get('[role="status"]');
  }

  // ── Status ────────────────────────────────────────────────────────────────────

  static get statusBadgeActive() {
    return cy.contains('.badge', 'Active');
  }

  static get statusBadgeInactive() {
    return cy.contains('.badge', 'Inactive');
  }

  // ── Deactivate ────────────────────────────────────────────────────────────────

  static get deactivateButton() {
    return cy.findByRole('button', { name: 'Deactivate' });
  }

  static get deactivateModal() {
    return cy.findByRole('dialog', { name: 'Deactivate Realm?' });
  }

  static get deactivateConfirmButton() {
    return RealmSettingsPage.deactivateModal.findByRole('button', { name: 'Deactivate' });
  }

  // ── Delete ────────────────────────────────────────────────────────────────────

  static get deleteRealmButton() {
    return cy.get('.card-title')
      .contains('Delete Realm')
      .parents('.card')
      .findByRole('button', { name: 'Delete Realm' });
  }

  static get deleteRealmModal() {
    return cy.findByRole('dialog', { name: 'Delete Realm?' });
  }

  static get deleteRealmConfirmButton() {
    return RealmSettingsPage.deleteRealmModal.findByRole('button', { name: 'Delete' });
  }

  // ── Login form (used to verify realm accessibility) ───────────────────────────

  static get loginFormUsernameField() {
    return cy.findByLabelText(/User Name/i, { timeout: 10000 });
  }

  static get loginPageErrorHeading() {
    return cy.findByRole('heading', { name: 'Error', timeout: 10000 });
  }

  static get orgInactiveAlert() {
    return cy.findByRole('alert', { timeout: 10000 });
  }
}
