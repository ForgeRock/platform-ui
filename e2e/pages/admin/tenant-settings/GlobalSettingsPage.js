/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
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
}
