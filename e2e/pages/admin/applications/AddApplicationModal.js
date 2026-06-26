/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const SIGN_IN_METHOD_RADIOS = {
  OIDC: /^OIDC - OpenId Connect/,
  SAML: /^SAML/,
  WSFED: /^WS-Fed/,
  Bookmark: /^Bookmark/,
};

const APPLICATION_TYPE_RADIOS = {
  Native: /^Native \/ SPA/,
  Web: /^Web/,
  Service: /^Service/,
};

export default class AddApplicationModal {
  static get signInMethodDialog() {
    return cy.findByRole('dialog', { name: /add a custom application/i });
  }

  static get applicationDetailsDialog() {
    return cy.findByRole('dialog', { name: /application details/i });
  }

  static settingsDialog(type = 'Native') {
    const dialogName = {
      Native: /native \/ spa settings/i,
      Web: /web settings/i,
      Service: /service settings/i,
    }[type];
    return cy.findByRole('dialog', { name: dialogName });
  }

  static signInMethodRadio(method) {
    return AddApplicationModal.signInMethodDialog.findByRole('radio', { name: SIGN_IN_METHOD_RADIOS[method] });
  }

  static applicationTypeRadio(type) {
    return AddApplicationModal.signInMethodDialog.findByRole('radio', { name: APPLICATION_TYPE_RADIOS[type] });
  }

  static get nextButton() {
    return cy.findByRole('button', { name: /^next$/i });
  }

  static get createApplicationButton() {
    return cy.findByRole('button', { name: /create application/i });
  }

  static get nameInput() {
    return AddApplicationModal.applicationDetailsDialog.findByLabelText('Name');
  }

  static get ownerSearchInput() {
    // .eq(1): the multiselect library renders a hidden internal input first; the visible search input is the second
    return AddApplicationModal.applicationDetailsDialog.findAllByPlaceholderText('Type to search for User').eq(1);
  }

  static ownerOption(ownerUsername) {
    return AddApplicationModal.applicationDetailsDialog.findByRole('option').contains(ownerUsername);
  }

  static clientIdInput(type = 'Native') {
    return AddApplicationModal.settingsDialog(type).findByLabelText('Client ID');
  }
}
