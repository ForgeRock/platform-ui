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
