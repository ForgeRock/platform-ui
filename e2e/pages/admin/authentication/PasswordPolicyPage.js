/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/**
 * Page object for the Password Policy page (Authentication > Password Policy).
 * Selectors verified against packages/platform-admin/src/views/PasswordPolicy/.
 */
export default class PasswordPolicyPage {
  static get userTab() {
    return cy.findByRole('tab', { name: Cypress.env('IS_FRAAS') ? 'Alpha realm - Users' : 'Users' });
  }

  /**
   * The "Must contain" enable checkbox. Its accessible name comes from the
   * aria-label on the BFormCheckbox (passwordPolicy.minNumCharacterSets).
   */
  static get mustContainCheckbox() {
    return cy.findByRole('checkbox', { name: 'Minimum number of character sets required' });
  }

  /**
   * The "Must contain" N-of-sets select, rendered by FrField as a
   * data-testid="fr-field-minCharacterSetsRequired" wrapper (see
   * platform-shared/src/components/Field/index.vue, data-testid = `fr-field-${name}`).
   */
  static get mustContainSelect() {
    return cy.findByTestId('fr-field-minCharacterSetsRequired');
  }

  static mustContainOption(optionLabel) {
    return cy.get('.multiselect__element > .multiselect__option').contains(optionLabel);
  }

  static get mustContainSelectedValue() {
    return PasswordPolicyPage.mustContainSelect.find('.multiselect__single');
  }

  static characterSetCheckbox(localeKey) {
    return cy.findByLabelText(localeKey);
  }

  static get saveButton() {
    return cy.findByRole('button', { name: 'Save' });
  }
}
