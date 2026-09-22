/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Page object for the Sign On tab of a SAML application's edit page
 * (src/views/Applications/EditApplication/SignOn/SamlSignOn), covering the
 * SSO setup modal, the journey picker and the update-metadata flow.
 */
export default class ApplicationSignOnPage {
  static get signOnTab() {
    return cy.findByRole('tab', { name: 'Sign On' }, { timeout: 15000 });
  }

  static openSignOnTab() {
    ApplicationSignOnPage.signOnTab.click();
  }

  // "Set Up SSO" button rendered by FrNoData before any metadata is configured
  static get setUpSsoButton() {
    return cy.findByRole('button', { name: 'Set Up SSO' });
  }

  // "Update Metadata" quick-start button once metadata has been uploaded
  static get updateMetadataButton() {
    return cy.findByRole('button', { name: 'Update Metadata' });
  }

  static get setupSsoModal() {
    return cy.get('#setupSsoModal');
  }

  static get setupSsoNextButton() {
    return ApplicationSignOnPage.setupSsoModal.findByRole('button', { name: 'Next' });
  }

  // --- Journey picker (JourneyPicker component, SAML apps) ---

  static get journeyCheckbox() {
    return cy.findByRole('checkbox', { name: 'Use a journey to authenticate users to this application.' });
  }

  static get journeySelect() {
    return cy.findByRole('combobox', { name: 'Journey' });
  }

  static get addJourneyButton() {
    return cy.findByTestId('beforeListAddButton');
  }

  // --- Save ---

  static get saveButton() {
    return cy.get('#app-submit');
  }
}
