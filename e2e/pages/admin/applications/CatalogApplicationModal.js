/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Page object for the "Browse App Catalog" modal
 * (src/views/Applications/CreateCatalogApplicationModal).
 */
export default class CatalogApplicationModal {
  static get modal() {
    return cy.get('#CreateCatalogApplicationModal');
  }

  static get searchInput() {
    // one search input per category tab; query all and use the first (All Apps)
    return CatalogApplicationModal.modal.findAllByPlaceholderText('Filter apps').eq(0);
  }

  /**
   * Card radio for a catalog application template, selected by the visible
   * display name (template ids live on the CDN, not in this codebase).
   * The catalog card title is the app template's displayName (e.g. 'Scim').
   * Cards are CardRadioInput overlays: the radio input is invisible and
   * full-card, so clicks need force.
   */
  static appCard(displayName) {
    return CatalogApplicationModal.modal.contains('.card', displayName);
  }

  static get nextButton() {
    return CatalogApplicationModal.modal.findByRole('button', { name: 'Next' });
  }

  static get createApplicationButton() {
    return CatalogApplicationModal.modal.findByRole('button', { name: 'Create Application' });
  }

  static get nameInput() {
    return CatalogApplicationModal.modal.findByLabelText('Name');
  }

  static get ownerSearchInput() {
    // .eq(1): the multiselect library renders a hidden internal input first; the visible search input is the second
    return CatalogApplicationModal.modal.findAllByPlaceholderText('Type to search for User').eq(1);
  }

  static ownerOption(ownerUsername) {
    return CatalogApplicationModal.modal.findByRole('option').contains(ownerUsername);
  }

  static fillDetails({ name, ownerUsername }) {
    CatalogApplicationModal.nameInput.clear().type(name);
    CatalogApplicationModal.ownerSearchInput.type(`{del}${ownerUsername}`, { force: true });
    CatalogApplicationModal.ownerOption(ownerUsername).click({ force: true });
  }
}
