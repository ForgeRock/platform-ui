/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { resolveJourneyURL } from '@e2e/utils/journeyUtils';

/**
 * Common steps for the login app (am/XUI), shared by all login-app test
 * features. Feature-specific steps live in their own step classes; only
 * steps useful across features belong here.
 */
export default class CommonLoginSteps {
  /**
   * Opens the given journey in the login app. Works for both JOURNEYS
   * constants entries and fixture trees imported at runtime.
   * @param {String} journeyName journey name
   */
  static navigateToJourney(journeyName) {
    cy.visit(resolveJourneyURL(journeyName));
  }
}
