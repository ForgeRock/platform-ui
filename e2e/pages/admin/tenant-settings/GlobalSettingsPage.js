/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class GlobalSettingsPage {
  static get contentSecurityPolicyItem() {
    return cy.findByRole('button', { name: /content security policy/i }, { timeout: 10000 });
  }

  static get cookieItem() {
    return cy.findByRole('button', { name: /^cookie/i }, { timeout: 10000 });
  }

  static get corsItem() {
    return cy.findByRole('button', { name: /cross-origin resource sharing/i }, { timeout: 10000 });
  }

  static get esvItem() {
    return cy.findByRole('button', { name: /environment secrets & variables/i }, { timeout: 10000 });
  }

  static get ipAddressesItem() {
    return cy.findByRole('button', { name: /ip addresses/i }, { timeout: 10000 });
  }

  static get logApiKeysItem() {
    return cy.findByRole('button', { name: /log api keys/i }, { timeout: 10000 });
  }

  static get serviceAccountsItem() {
    return cy.findByRole('button', { name: /service accounts/i }, { timeout: 10000 });
  }

  static get sslConfigurationsItem() {
    return cy.findByRole('button', { name: /ssl configurations/i }, { timeout: 10000 });
  }

  static get endUserUIItem() {
    return cy.findByRole('button', { name: /end user ui/i }, { timeout: 10000 });
  }

  static get contentSecurityPolicyStatus() {
    return GlobalSettingsPage.contentSecurityPolicyItem.find('.col-md-6 > span');
  }
}
