/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class EndUserUIPage {
  static hostedPageItem(pageType) {
    return cy.findByRole('heading', { name: pageType }).closest('.card-body');
  }

  static hostedPageStatus(pageType) {
    return EndUserUIPage.hostedPageItem(pageType).find('.badge');
  }

  static hostedPageToggleButton(pageType, action) {
    return EndUserUIPage.hostedPageItem(pageType).findByRole('button', { name: action });
  }

  // ── Company name section (Hosted Sign In Pages card) ─────────────────────────

  static get companyNameAddButton() {
    return EndUserUIPage.hostedPageItem('Hosted Sign In Pages').findByRole('button', { name: 'Add' });
  }

  static get companyNameEditButton() {
    return EndUserUIPage.hostedPageItem('Hosted Sign In Pages').findByRole('button', { name: 'Edit' });
  }

  static get companyNameNotConfiguredText() {
    return EndUserUIPage.hostedPageItem('Hosted Sign In Pages').findByText('Not Configured');
  }

  static companyNameValueText(companyName) {
    return EndUserUIPage.hostedPageItem('Hosted Sign In Pages').findByText(companyName);
  }

  static companyNamePreviewText(companyName) {
    return EndUserUIPage.hostedPageItem('Hosted Sign In Pages').findByText(`Login - ${companyName}`);
  }

  // ── Add/Edit Company Name modal ─────────────────────────────────────────────

  static get companyNameModal() {
    return cy.findByRole('dialog', { name: /Company Name/ });
  }

  static get companyNameAddModalHeading() {
    return EndUserUIPage.companyNameModal.findByRole('heading', { name: 'Add Company Name' });
  }

  static get companyNameEditModalHeading() {
    return EndUserUIPage.companyNameModal.findByRole('heading', { name: 'Edit Company Name' });
  }

  static get companyNameInput() {
    return EndUserUIPage.companyNameModal.findByTestId('fr-field-companyName').find('input');
  }

  static get companyNameSaveButton() {
    return EndUserUIPage.companyNameModal.findByRole('button', { name: 'Save' });
  }

  static get companyNameClearButton() {
    return EndUserUIPage.companyNameModal.findByRole('button', { name: 'Clear' });
  }
}
