/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Page object for the Tenant Settings > Federation tab
 * (packages/platform-admin/src/views/TenantSettings/FederationTab).
 */
export default class FederationPage {
  // ── Federation tab ───────────────────────────────────────────────────────────

  // Spinner shown while the provider list, template and enforcement policy load
  static loadingSpinner(options = {}) {
    return cy.findByTestId('spinner-is-loading-sign-on-providers', options);
  }

  static get addIdentityProviderButton() {
    return cy.findByRole('button', { name: /Identity Provider/ });
  }

  // ── New provider modal (NewProviderModal, id="newProviderModal") ─────────────

  static get newProviderModal() {
    return cy.get('#newProviderModal');
  }

  // Stage 1 - "Add Sign On Method" provider selection
  static get addSignOnMethodTitle() {
    return FederationPage.newProviderModal.findByText('Add Sign On Method');
  }

  static providerOption(providerKey) {
    return FederationPage.newProviderModal.findByTestId(`provider-option-${providerKey}`);
  }

  static get nextButton() {
    return FederationPage.newProviderModal.findByTestId('provider-next-button');
  }

  // Stage 2/3 share the "Set up <provider>" super title
  static setUpProviderTitle(providerShortName) {
    return FederationPage.newProviderModal.findByText(`Set up ${providerShortName}`);
  }

  // Stage 2 - "Configure Application"
  static get configureApplicationTitle() {
    return FederationPage.newProviderModal.findByText('Configure Application');
  }

  // Stage 3 - "Identity Provider Details" form (SettingsPanel)
  static get identityProviderDetailsTitle() {
    return FederationPage.newProviderModal.findByText('Identity Provider Details');
  }

  static providerDetailField(label) {
    return FederationPage.newProviderModal.findByLabelText(label);
  }

  static get saveButton() {
    return FederationPage.newProviderModal.findByRole('button', { name: 'Save' });
  }

  // ── Edit provider view (EditProvider, #/tenant-settings/federation/:name) ────

  static editProviderPageHeading(providerName) {
    return cy.findByRole('heading', { level: 1, name: providerName });
  }

  // SchemaStateButton dropdown showing the provider's Active/Inactive state
  static get providerStateButton() {
    return cy.findByRole('button', { name: /Active|Inactive/ });
  }
}
