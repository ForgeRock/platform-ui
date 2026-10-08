/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { SLOW_MOUNT_TIMEOUT } from '@e2e/support/constants';
import BaseAdminPage from '../BaseAdminPage';

/**
 * Page Object for the Languages list view (/languages).
 * The /languages route is gated on the uiLocalizationEnabled feature flag
 * (off on PR-pipeline tenants), so first navigation flips the flag at
 * runtime and navigates in-app without a page reload.
 */
export default class LanguagesPage extends BaseAdminPage {
  /**
   * Navigate to the Languages list. Skips the visit/in-app navigation when
   * the browser is already on the list (e.g. after a cached login lands there).
   * Note the `endsWith` check is deliberate: `#/languages/fr` must not count
   * as already being on the list.
   */
  static visit() {
    const languagesUrl = Cypress.env('IS_FRAAS') ? '/platform/?realm=alpha#/languages' : '/platform/#/languages';
    cy.intercept('GET', '**/openidm/config/uilocale*').as('localesLoaded');
    cy.url().then((currentUrl) => {
      if (!currentUrl.includes('/platform/')) {
        cy.visit(languagesUrl, { failOnStatusCode: false });
        cy.enableUiLocalizationAndNavigate('/languages');
      } else if (!currentUrl.endsWith('#/languages')) {
        cy.enableUiLocalizationAndNavigate('/languages');
      }
    });
    LanguagesPage.pageHeading.should('be.visible');
  }

  static get pageHeading() {
    return cy.findByRole('heading', { name: 'Languages', level: 1 }, { timeout: SLOW_MOUNT_TIMEOUT });
  }

  static get addLanguageButton() {
    return cy.findByRole('button', { name: /add language/i }).first();
  }

  static get addLanguageModal() {
    return cy.findByRole('dialog', { name: /add language/i });
  }

  // Clicking this opens the multiselect and reveals the underlying options list
  static get languageCombobox() {
    return LanguagesPage.addLanguageModal.findByRole('combobox');
  }

  // An option in the Add Language multiselect dropdown
  static languageOption(name) {
    return LanguagesPage.addLanguageModal.find('.multiselect__option').contains('span', name);
  }

  // The modal footer confirmation button, labelled "Add Language" like the toolbar button
  static get modalAddButton() {
    return LanguagesPage.addLanguageModal.find('.modal-footer').findByRole('button', { name: /add language/i });
  }

  /**
   * The table row for the given locale code (the code is shown in parentheses
   * next to the language name, e.g. "French (fr)").
   * @param {string} localeCode - Locale code, e.g. 'fr'
   */
  static languageRow(localeCode) {
    return cy.get('#list-resource-table', { timeout: SLOW_MOUNT_TIMEOUT }).contains('tbody tr', `(${localeCode})`);
  }

  /**
   * The coverage cell content for the given locale row, e.g. "2 / 3187  0%".
   * Columns are Language, Status, Coverage, Last Updated, Actions — coverage
   * is the third cell.
   * @param {string} localeCode - Locale code, e.g. 'fr'
   */
  static coverageCell(localeCode) {
    return LanguagesPage.languageRow(localeCode).find('td').eq(2);
  }

  /**
   * The last updated cell for the given locale row.
   * @param {string} localeCode - Locale code, e.g. 'fr'
   */
  static lastUpdatedCell(localeCode) {
    return LanguagesPage.languageRow(localeCode).find('td').eq(3);
  }
}
