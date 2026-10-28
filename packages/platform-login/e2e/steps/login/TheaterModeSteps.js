/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  generateThemeStructure, createThemes, deleteThemes,
} from '@e2e/utils/themeutils';
import { generateRawJourneyURL } from '@e2e/utils/journeyUtils';
import TheaterLayoutPage from '@e2e/pages/login/TheaterLayoutPage';
import SocialLoginJourneyPage from '@e2e/pages/login/SocialLoginJourneyPage';

/**
 * Steps for verifying login journeys rendered in theater mode: creates a
 * dedicated test theme with `journeyTheaterMode` and a non-card
 * `journeyLayout` linked to the target journey, visits the journey, and
 * cleans the theme up afterwards. No shared QA theme is ever mutated.
 */
export default class TheaterModeSteps {
  static createdThemeName = null;

  /**
   * Creates a dedicated test theme configured for theater mode and linked
   * to the given journey, so App.vue resolves it when the journey renders.
   * Store the generated theme name to pass to cleanupTheaterTheme().
   * @param {String} journeyName journey (tree) name to link the theme to
   * @returns {Cypress.Chainable} resolves once the theme exists and is configured
   */
  static setupTheaterTheme(journeyName) {
    const theme = generateThemeStructure({
      journeyTheaterMode: true,
      journeyLayout: 'justified-left',
      linkedTrees: [journeyName],
    });
    this.createdThemeName = theme.name;
    return createThemes([theme]);
  }

  /**
   * Visits the given journey and asserts the login page rendered
   * (`main#callbacksPanel`), failing early if the visit broke.
   * @param {String} journeyName journey (tree) name as deployed
   */
  static visitTheaterJourney(journeyName) {
    cy.intercept('GET', '/openidm/ui/theme/**').as('getTheme');
    cy.visit(generateRawJourneyURL(journeyName));
    cy.wait('@getTheme', { timeout: 10000 });
    TheaterLayoutPage.callbacksPanel.should('be.visible');
  }

  /**
   * Asserts the social IDP button for the given provider is present and visible.
   * @param {String} providerName display name shown on the button, e.g. 'Google'
   */
  static assertIdpButtonVisibleInJourneyCard(providerName) {
    SocialLoginJourneyPage.socialButton(providerName).should('be.visible');
  }

  /**
   * Deletes the theme created by setupTheaterTheme. Callable from the
   * spec's afterEach — safe to call when no theme was created.
   */
  static cleanupTheaterTheme() {
    const themeName = this.createdThemeName;
    this.createdThemeName = null;
    if (!themeName) {
      return cy.wrap(null);
    }
    return deleteThemes([themeName]);
  }
}
