/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { cloneDeep } from 'lodash';
import { getIDMThemes, putIDMResource } from '@e2e/api/journeyApi.e2e';

/**
 * Restores theme fields that a test mutated through the UI. Themes live inside
 * the single `/openidm/config/ui/themerealm` document, so field-level rollback
 * is a snapshot + filtered PUT of the whole document — deleting the theme
 * (deleteThemes) would remove shared test fixtures the next run re-imports.
 */
export default class ThemeApiSteps {
  static mutatedThemeFields = {};

  /**
   * Snapshots the given theme fields so they can be restored later. Must be
   * called before the test mutates any of the fields through the UI.
   * @param {String} themeName theme name as shown in the Hosted Pages list
   * @param {String[]} fieldNames theme field keys to snapshot (e.g. ['logo', 'logoAltText'])
   */
  static snapshotThemeFields(themeName, fieldNames) {
    return getIDMThemes().then((response) => {
      const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
      const theme = response.body.realm[realm].find((t) => t.name === themeName);
      if (!theme) {
        throw new Error(`Theme "${themeName}" not found in realm "${realm}"`);
      }
      ThemeApiSteps.mutatedThemeFields[themeName] = {};
      fieldNames.forEach((fieldName) => {
        ThemeApiSteps.mutatedThemeFields[themeName][fieldName] = cloneDeep(theme[fieldName]);
      });
      return ThemeApiSteps.mutatedThemeFields[themeName];
    });
  }

  /**
   * Restores every field snapshotted for the given theme. Fields that were
   * absent from the theme before the test are removed again.
   */
  static restoreThemeFields(themeName) {
    const fields = ThemeApiSteps.mutatedThemeFields[themeName];
    if (!fields) {
      return cy.wrap(null);
    }
    return getIDMThemes().then((response) => {
      const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
      const theme = response.body.realm[realm].find((t) => t.name === themeName);
      if (!theme) {
        // The theme was removed by another actor; nothing to restore.
        return null;
      }
      Object.entries(fields).forEach(([fieldName, previousValue]) => {
        if (previousValue === undefined) {
          delete theme[fieldName];
        } else {
          theme[fieldName] = cloneDeep(previousValue);
        }
      });
      return putIDMResource('config/ui', 'themerealm', response.body);
    });
  }

  /**
   * Restores every theme that had fields snapshotted, then clears the tracker.
   * Used by afterEach so a failed test still rolls the tenant back.
   */
  static restoreAllMutatedThemes() {
    const themeNames = Object.keys(ThemeApiSteps.mutatedThemeFields);
    if (!themeNames.length) {
      return cy.wrap(null);
    }
    return cy.wrap(themeNames).each((themeName) => ThemeApiSteps.restoreThemeFields(themeName))
      .then(() => {
        ThemeApiSteps.mutatedThemeFields = {};
      });
  }

  /**
   * Reads a single theme's field from the themerealm document and passes it to
   * the given assertion callback.
   * @param {String} themeName theme name as shown in the Hosted Pages list
   * @param {String} fieldName field to read (e.g. 'logo')
   * @param {Function} assertionFn receives the field value — chain .should() on it
   */
  static assertThemeField(themeName, fieldName, assertionFn) {
    getIDMThemes().then((response) => {
      const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
      const theme = response.body.realm[realm].find((t) => t.name === themeName);
      if (!theme) {
        throw new Error(`Theme "${themeName}" not found in realm "${realm}"`);
      }
      assertionFn(theme[fieldName]);
    });
  }

  /**
   * Asserts a theme field contains the expected value fragment, whether the
   * field persisted as a plain scalar or as a locale map (the account-tab
   * modal instance is shared between the Expanded and Collapsed cards, so a
   * second open in the same session stays localized and saves a map).
   * @param {String} themeName theme name as shown in the Hosted Pages list
   * @param {String} fieldName field to read (e.g. 'logoProfileCollapsed')
   * @param {String} expectedFragment fragment the value must contain
   */
  static assertThemeFieldContains(themeName, fieldName, expectedFragment) {
    ThemeApiSteps.assertThemeField(themeName, fieldName, (value) => {
      expect(JSON.stringify(value), `theme.${fieldName}`).to.include(expectedFragment);
    });
  }
}
