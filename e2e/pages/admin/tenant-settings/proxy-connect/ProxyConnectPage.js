/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class ProxyConnectPage {
  static get heading() {
    return cy.findByRole('heading', { name: 'Proxy Connect', timeout: 10000 });
  }

  static get statusRadioGroup() {
    return cy.get('input[name="status"]');
  }

  static get statusRadioOptionOpen() {
    return ProxyConnectPage.statusRadioGroup.filter('[value="OPEN"]');
  }

  static get statusRadioOptionFiltering() {
    return ProxyConnectPage.statusRadioGroup.filter('[value="FILTERING"]');
  }

  static get securityHeadersTab() {
    return cy.findByRole('tab', { name: 'Security Headers' });
  }

  static get ipAddressFilteringTab() {
    return cy.findByRole('tab', { name: 'IP Address Filtering' });
  }

  static get securityHeadersTable() {
    return cy.get('.security-headers-table');
  }

  static securityHeaderRow(headerName) {
    return ProxyConnectPage.securityHeadersTable.contains('tr', headerName);
  }

  static get securityHeadersNoData() {
    return cy.findByTestId('security-headers-no-data');
  }

  static get addSecurityHeaderButton() {
    return cy.findByRole('button', { name: /new security header/i });
  }

  static get addSecurityHeaderEmptyStateButton() {
    return ProxyConnectPage.securityHeadersNoData.findByRole('button', { name: /add security header/i });
  }

  static get enabledSwitch() {
    return cy.findByRole('switch', { name: 'Enabled' });
  }

  static get ipTagInput() {
    return cy.findByLabelText('Accepted IP Addresses').parent().find('.fr-tag-input', { timeout: 10000 });
  }

  static ipTagRemoveButton(ip) {
    return cy.findByLabelText('Accepted IP Addresses').parent().find(`[data-testid="remove-${ip}-tag"]`);
  }

  /**
   * The pending-updates banner (FrAlert). FrAlert renders role="alert" without
   * a title, so its accessible name is empty and it cannot be queried by name —
   * select by the banner's sentence instead.
   */
  static get pendingUpdatesAlert() {
    return cy.contains('[data-testid="FrAlert"]', /you have \d+ updates? to apply/i, { timeout: 10000 });
  }

  static get viewUpdatesButton() {
    return cy.findByRole('button', { name: /view update/i });
  }

  static get applyUpdatesModal() {
    return cy.findByRole('dialog', { name: 'Pending Proxy Connect Updates' });
  }

  static get applyUpdatesModalApplyUpdatesButton() {
    return ProxyConnectPage.applyUpdatesModal.findByRole('button', { name: /^apply \d+ update/i });
  }

  static get applyUpdatesModalApplyNowButton() {
    return ProxyConnectPage.applyUpdatesModal.findByRole('button', { name: 'Apply Now' });
  }

  static applyUpdatesModalCard(cardHeadingText) {
    return ProxyConnectPage.applyUpdatesModal.findByRole('heading', { name: cardHeadingText }).parents('.card');
  }
}
