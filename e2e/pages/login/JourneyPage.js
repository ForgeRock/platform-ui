/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateJourneyURL } from '../../utils/journeyUtils';

// 16x16 solid blue SVG served for the test's synthetic logo URL — the tests
// enter unique example.com URLs the browser cannot load, so the img would
// otherwise render the broken-image placeholder instead of the picture.
// A string body is used because Cypress mangles Buffer bodies in intercept
// stubs (the img never decodes), while an SVG string renders correctly.
const STUBBED_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="#00f"/></svg>';

/**
 * POM for the login app rendering a given journey's first page (sign-in page
 * or reset-password page alike — any journey the login app serves). The
 * page's logo <img> src comes from the journey's theme either way, but the
 * card, justified and theater layouts render it in different wrappers — so
 * the img is located by src fragment rather than by a layout-specific testid
 * (the QA themes render in card layout, which has no in-situ-logo-preview
 * testid).
 */
export default class JourneyPage {
  /**
   * Serves a real image for the given logo src fragment and loads the given
   * journey's first page anonymously (no login). The stub is registered
   * before the visit so the theme logo <img> request is fulfilled by it.
   * @param {String} journeyName journey name from the JOURNEYS constants
   * @param {String} logoUrlFragment fragment of the logo src URL to stub
   */
  static visitWithStubbedLogo(journeyName, logoUrlFragment) {
    cy.intercept(`**/*${logoUrlFragment}*`, {
      statusCode: 200,
      headers: { 'content-type': 'image/svg+xml' },
      body: STUBBED_SVG,
    });
    cy.intercept('GET', '/openidm/ui/theme/**').as('getJourneyTheme');
    cy.visit(generateJourneyURL(journeyName));
    cy.wait('@getJourneyTheme', { timeout: 10000 });
  }

  static logo(logoUrlFragment) {
    return cy.get(`img[src*="${logoUrlFragment}"]`);
  }
}
