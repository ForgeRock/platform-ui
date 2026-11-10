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
 * features.
 */
export default class CommonLoginSteps {
  /**
   * Opens the given journey in the login app
   */
  static navigateToJourney(journeyName, { newSession = false } = {}) {
    const url = resolveJourneyURL(journeyName);
    cy.visit(newSession ? `${url}&arg=newsession` : url, { timeout: 120000 });
  }
}
