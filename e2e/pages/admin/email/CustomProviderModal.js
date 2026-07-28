/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export default class CustomProviderModal {
  static get modal() {
    return cy.findByRole('dialog', { name: 'Add a Custom Email Provider' });
  }

  static get activeModal() {
    return cy.get('[role="dialog"]');
  }

  static get nextButton() {
    return CustomProviderModal.activeModal.findByRole('button', { name: 'Next' });
  }

  static get previousButton() {
    return CustomProviderModal.activeModal.findByRole('button', { name: 'Previous' });
  }

  static get saveButton() {
    return CustomProviderModal.activeModal.findByRole('button', { name: 'Save' });
  }

  static get configureProviderSubtitle() {
    return CustomProviderModal.activeModal.findByText('Configure Provider');
  }

  static microsoftGraphRadio() {
    return CustomProviderModal.modal.findByRole('radio', { name: /Microsoft Graph/i });
  }

  static customProviderRadio() {
    return CustomProviderModal.modal.findByRole('radio', { name: /Custom Provider/i });
  }

  static get fromAddressInput() {
    return CustomProviderModal.activeModal.find('[data-testid="fr-field-from"] input[name="from"]');
  }

  static get mailEndpointInput() {
    return CustomProviderModal.activeModal.find('[data-testid="fr-field-mailEndpoint"] input[name="mailEndpoint"]');
  }

  static get clientIdInput() {
    return CustomProviderModal.activeModal.find('[data-testid="fr-field-clientId"] input[name="clientId"]');
  }

  static get clientSecretInput() {
    return CustomProviderModal.activeModal.find('[data-testid="fr-field-clientSecret"] input[name="clientSecret"]');
  }

  static get tokenEndpointInput() {
    return CustomProviderModal.activeModal.find('[data-testid="fr-field-tokenEndpoint"] input[name="tokenEndpoint"]');
  }

  static get hostInput() {
    return CustomProviderModal.activeModal.find('[data-testid="fr-field-host"] input[name="host"]');
  }

  static get portInput() {
    return CustomProviderModal.activeModal.find('[data-testid="fr-field-port"] input[name="port"]');
  }

  static get usernameInput() {
    return CustomProviderModal.activeModal.find('[data-testid="fr-field-username"] input[name="username"]');
  }

  static get passwordInput() {
    return CustomProviderModal.activeModal.find('[data-testid="fr-field-password"] input[name="password"]');
  }
}
