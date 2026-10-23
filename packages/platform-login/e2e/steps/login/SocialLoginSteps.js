/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import CommonLoginSteps from '@e2e/steps/login/commonLoginSteps';
import SocialLoginJourneyPage from '@e2e/pages/login/SocialLoginJourneyPage';

/**
 * Steps for social IDP login journeys (SelectIdPCallback-driven pages):
 * visiting a social journey, clicking a "Sign in with ..." button,
 * leaving the IDP redirect (browser back or navigating elsewhere), and
 * returning to the reference Login journey.
 */
export default class SocialLoginSteps {
  /**
   * Opens the given journey (constants-based or fixture tree name) in the
   * login app, waiting for the given provider's social button to render.
   * @param {String} journeyName journey name — either a JOURNEYS constants
   *   entry name or a fixture tree name as deployed
   * @param {String} providerName display name shown on the button, e.g. 'Google'
   */
  static visitSocialJourney(journeyName, providerName) {
    CommonLoginSteps.navigateToJourney(journeyName);
    SocialLoginJourneyPage.socialButton(providerName).should('exist');
  }

  /**
   * Clicks the "Sign in with {provider}" button, leaving for the IDP.
   * @param {String} providerName display name shown on the button, e.g. 'Google'
   */
  static startSocialLoginWith(providerName) {
    SocialLoginJourneyPage.socialButton(providerName).click();
  }

  /**
   * Registers the authenticate intercept alias. Register BEFORE the action
   * that should trigger the request — order determines which round-trip is caught.
   */
  static interceptAuthenticate() {
    cy.intercept('POST', '**/authenticate*').as('authenticate');
  }

  static waitAuthenticateReturn() {
    cy.wait('@authenticate', { timeout: 20000 });
  }

  /**
   * Removes the login app's journey resumption state (localStorage
   * treeResumeData and the reentry cookie — keys from authResumptionUtil.js)
   * on the next page load, so a back-navigation renders a fresh journey
   * instead of resuming the interrupted one.
   */
  static scrubResumptionState() {
    cy.on('window:before:load', (win) => {
      try {
        if (win.location.href.includes('am/XUI')) {
          win.localStorage.removeItem('treeResumeData');
          win.document.cookie = 'reentry="";expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }
      } catch (error) {
        // storage unavailable — resume state simply stays
      }
    });
  }
}
