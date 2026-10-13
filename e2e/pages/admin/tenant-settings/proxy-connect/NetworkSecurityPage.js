/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class NetworkSecurityPage {
  /**
   * Card title heading — only rendered once the settings card list has loaded,
   * so awaiting its visibility also waits out the loading spinner.
   */
  static get proxyConnectCardTitle() {
    return cy.findByRole('heading', { name: 'Proxy Connect', timeout: 10000 });
  }

  static get proxyConnectCardStatus() {
    return NetworkSecurityPage.proxyConnectCardTitle.closest('.row').find('.badge');
  }

  static get proxyConnectConfigureButton() {
    return NetworkSecurityPage.proxyConnectCardTitle.closest('.row').find('button');
  }
}
