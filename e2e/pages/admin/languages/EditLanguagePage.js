/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { DEBOUNCED_STATE_TIMEOUT, SLOW_MOUNT_TIMEOUT } from '@e2e/support/constants';
import BaseAdminPage from '../BaseAdminPage';

/**
 * Page Object for the Language Editor (/languages/:languageCode).
 * Exposes selectors and raw interactions for the section sidebar, the
 * translation keys table, and the toolbar actions menu.
 */
export default class EditLanguagePage extends BaseAdminPage {
  /**
   * Navigate directly to the editor for the given locale.
   * The /languages routes are gated on the uiLocalizationEnabled feature flag
   * (off on PR-pipeline tenants), so first navigation flips the flag at
   * runtime and navigates in-app without a page reload. Waits for the initial
   * data load to settle (the keys table renders) so autoSelectFirstSection
   * cannot later overwrite a section the test selects.
   * @param {string} localeCode - Locale code, e.g. 'fr'
   */
  static visit(localeCode) {
    const editorUrl = Cypress.env('IS_FRAAS')
      ? `/platform/?realm=alpha#/languages/${localeCode}`
      : `/platform/#/languages/${localeCode}`;
    cy.intercept('GET', `**/openidm/config/uilocale/${localeCode}*`).as('localeLoaded');
    cy.url().then((currentUrl) => {
      if (!currentUrl.includes('/platform/')) {
        cy.visit(editorUrl, { failOnStatusCode: false });
        cy.enableUiLocalizationAndNavigate(`/languages/${localeCode}`);
      } else if (!currentUrl.includes(`#/languages/${localeCode}`)) {
        cy.enableUiLocalizationAndNavigate(`/languages/${localeCode}`);
      }
    });
    cy.wait('@localeLoaded', { timeout: SLOW_MOUNT_TIMEOUT });
    EditLanguagePage.pageHeading.should('be.visible');
    // Only rendered once the data load is complete
    EditLanguagePage.keysTable.should('exist');
  }

  static get pageHeading() {
    // The editor mounts after loading the locale config and the base
    // translation bundles — slow on remote environments
    return cy.findByRole('heading', { level: 1 }, { timeout: SLOW_MOUNT_TIMEOUT });
  }

  static get sectionNav() {
    return cy.findByRole('navigation', { name: 'Translation sections' }, { timeout: SLOW_MOUNT_TIMEOUT });
  }

  /**
   * A section button in the left sidebar. The button's aria-label reads
   * "<Name>, <Translated|Partially translated|Untranslated>" when the section
   * has a status, or just "<Name>" otherwise.
   * @param {string} name - Display name of the section, e.g. 'Editor'
   */
  static sectionButton(name) {
    // The sidebar renders hundreds of sections on slow environments — allow
    // extra time for it to mount
    return EditLanguagePage.sectionNav.findByRole('button', { name: new RegExp(`^${name}(,|$)`) }, { timeout: SLOW_MOUNT_TIMEOUT });
  }

  /**
   * The status circle (role="img") inside the given section button. Its
   * accessible name is the tooltip text: Translated / Partially translated /
   * Untranslated.
   * @param {string} name - Display name of the section, e.g. 'Editor'
   */
  static sectionStatusCircle(name) {
    return EditLanguagePage.sectionButton(name).find('[role="img"]');
  }

  static get keysTable() {
    return cy.findByRole('table', { name: 'Translation keys table' });
  }

  /**
   * The table row for a translation key. Matches on the displayed leaf key
   * name and/or the muted path below it.
   * @param {string} keyOrPath - Leaf key name or display path, e.g. 'helpSupport'
   */
  static keyRow(keyOrPath) {
    return EditLanguagePage.keysTable.contains('tbody tr', keyOrPath);
  }

  /**
   * The status circle in the given key row: 'Translated' when filled,
   * 'Untranslated' when empty.
   * @param {string} keyOrPath - Leaf key name or display path
   */
  static keyStatusCircle(keyOrPath) {
    return EditLanguagePage.keyRow(keyOrPath).find('[role="img"]');
  }

  /**
   * The translation textarea for the given key row.
   * @param {string} keyOrPath - Leaf key name or display path
   */
  static keyValueInput(keyOrPath) {
    return EditLanguagePage.keyRow(keyOrPath).find('textarea');
  }

  static get saveButton() {
    return cy.findByRole('button', { name: /^save$/i }, { timeout: DEBOUNCED_STATE_TIMEOUT });
  }

  // The "…" actions menu button in the editor navbar
  static get actionsMenuButton() {
    return cy.findByRole('navigation', { name: 'Header navigation' }).find('.menu-container button');
  }

  // The Export item inside the open actions menu
  static get exportMenuItem() {
    return cy.get('ul[role="menu"]').contains('[role="menuitem"]', /export/i);
  }
}
