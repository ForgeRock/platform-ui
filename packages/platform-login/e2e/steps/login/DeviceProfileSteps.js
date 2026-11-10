/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import CommonLoginSteps from '@e2e/steps/login/commonLoginSteps';
import { getIDMUser } from '@e2e/api/managedApi.e2e';
import LoginPage from '@e2e/pages/login/LoginPage';
import MessageNodePage from '@e2e/pages/login/MessageNodePage';

const DEVICE_PROFILES_ATTRIBUTE = 'deviceProfiles';
const PROFILE_IDENTIFIER_FIELD = 'identifier';

// Intentional fixed-interval poll of an async backend write/replication.
// eslint-disable-next-line cypress/no-unnecessary-waiting
const pollWait = (ms, next) => cy.wait(ms).then(next);

/**
 * The deviceProfiles entries are stored as JSON strings, not objects.
 */
function parseProfiles(profiles) {
  return profiles.map((profile) => (typeof profile === 'string' ? JSON.parse(profile) : profile));
}

function readDeviceProfiles(userId) {
  return getIDMUser(userId).then((response) => response.body[DEVICE_PROFILES_ATTRIBUTE] || []);
}

/**
 * Polls the IDM record until the saved profiles carry the given device id
 * (the DeviceSaveNode write is asynchronous). The final mismatch assert is
 * the authoritative rename tripwire: localStorage-key assertions elsewhere
 * can pass vacuously under an SDK key rename, this one cannot.
 */
function waitForSavedProfile(userId, deviceId, attemptsLeft = 10) {
  if (!userId) {
    throw new Error('No endUserId in Cypress.env — seed the user before reading device profiles');
  }
  return readDeviceProfiles(userId).then((rawProfiles) => {
    const profiles = parseProfiles(rawProfiles);
    const identifiers = profiles.map((profile) => profile[PROFILE_IDENTIFIER_FIELD]);
    if (identifiers.includes(deviceId)) {
      return undefined;
    }
    if (attemptsLeft <= 0) {
      cy.log(`deviceProfiles on the record: ${JSON.stringify(profiles)}`);
      expect(
        identifiers,
        `Saved profile identifier on the user record does not match the device id the browser presented: expected "${deviceId}" — FR-SDK-DeviceID must be stored and reused, not re-minted`,
      ).to.include(deviceId);
      return undefined;
    }
    return pollWait(1000, () => waitForSavedProfile(userId, deviceId, attemptsLeft - 1));
  });
}

/**
 * Polls a direct AM login for the freshly seeded user: on FRAAS the IDM
 * create returns before AM's auth servers see the user (replication lag).
 */
function waitForUserVisibleInAM(attemptsLeft = 24) {
  if (attemptsLeft <= 0) {
    throw new Error('Seeded enduser never became authenticatable on AM (replication lag?)');
  }
  const url = `https://${Cypress.env('FQDN')}/am/json/realms/${Cypress.env('IS_FRAAS') ? 'root/realms/alpha' : 'root'}/authenticate`;
  const headers = {
    'content-type': 'application/json',
    'Accept-API-Version': 'protocol=2.1,resource=1.0',
    'x-requested-with': 'XMLHttpRequest',
  };
  return cy.request({
    method: 'POST', url, headers, body: {}, failOnStatusCode: false,
  }).then((step1) => {
    if (step1.status !== 200 || !step1.body.callbacks) {
      return pollWait(5000, () => waitForUserVisibleInAM(attemptsLeft - 1));
    }
    const callbacks = (step1.body.callbacks || []).map((callback) => ({
      ...callback,
      input: callback.input.map(
        (input) => ({ ...input, value: input.name === 'IDToken1' ? Cypress.env('endUserName') : Cypress.env('endUserPassword') }),
      ),
    }));
    const body = { authId: step1.body.authId, callbacks };
    return cy.request({
      method: 'POST', url, headers, body, failOnStatusCode: false,
    }).then((step2) => {
      if (step2.status !== 200) {
        return pollWait(5000, () => waitForUserVisibleInAM(attemptsLeft - 1));
      }
      return undefined;
    });
  });
}

/**
 * Steps for the device-profile journeys: logging in through them, comparing
 * the FR-SDK-DeviceID localStorage key, driving the match-outcome MessageNode
 * screens, and verifying the saved profile on the user record.
 */
export default class DeviceProfileSteps {
  /**
   * Yields the FR-SDK-DeviceID localStorage value of the journey's origin.
   */
  static getDeviceId() {
    return cy.window().then((win) => win.localStorage.getItem('FR-SDK-DeviceID'));
  }

  /**
   * Stores a test-owned device id; the SDK reuses what is already stored,
   * so the save lands under this id.
   */
  static plantDeviceId(deviceId) {
    DeviceProfileSteps.getDeviceId().then((currentId) => {
      cy.window({ log: false }).then((win) => {
        if (currentId !== deviceId) {
          win.localStorage.setItem('FR-SDK-DeviceID', deviceId);
        }
      });
    });
  }

  /**
   * First login: asserts the UNKNOWN DEVICE outcome, confirms it, checks the
   * enduser app reached the dashboard, and verifies the user record carries
   * a saved profile for the current id.
   * Callers that planted a device id assert the equality themselves.
   */
  static saveDeviceProfile(journeyName, expectedUnknownDeviceMessage) {
    CommonLoginSteps.navigateToJourney(journeyName);
    DeviceProfileSteps.login([expectedUnknownDeviceMessage]);
    MessageNodePage.outcomeMessage(expectedUnknownDeviceMessage).should('be.visible');
    MessageNodePage.confirmButton(expectedUnknownDeviceMessage).click();
    cy.url({ timeout: 20000 }).should('contain', '#/dashboard');

    DeviceProfileSteps.getDeviceId().then((deviceId) => {
      expect(deviceId, 'FR-SDK-DeviceID is set after first login').to.be.a('string').and.to.have.length.greaterThan(0);
      Cypress.env('deviceProfileDeviceId', deviceId);
      waitForSavedProfile(Cypress.env('endUserId'), deviceId);
    });
  }

  /**
   * Shared re-login flow
   */
  static reLoginAndAssertMatch(journeyName, messageText) {
    CommonLoginSteps.navigateToJourney(journeyName, { newSession: true });
    DeviceProfileSteps.login([messageText], Cypress.env('deviceProfileDeviceId'));
    DeviceProfileSteps.assertAuthReachedOutcome(messageText);

    DeviceProfileSteps.getDeviceId().then((deviceId) => {
      expect(
        deviceId,
        `The SDK replaced the previously stored device id "${Cypress.env('deviceProfileDeviceId')}" `
        + `with "${deviceId}" — FR-SDK-DeviceID must be reused across logins, not re-minted`,
      ).to.equal(Cypress.env('deviceProfileDeviceId'));
    });
  }

  /**
   * Blocks until the freshly seeded enduser can actually authenticate on AM.
   */
  static waitUntilAuthenticatable() {
    cy.clearCookies();
    return waitForUserVisibleInAM();
  }

  /**
   * Verifies the saved device shows in the Admin console under the user's
   * Trusted Devices tab
   */
  static assertDeviceVisibleInAdmin() {
    const realm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
    cy.loginAsAdminCached();
    cy.then(() => {
      const endUserId = Cypress.env('endUserId');
      expect(endUserId, 'endUserId must be set before opening the admin console').to.be.a('string').and.to.have.length.greaterThan(0);
      const resourceType = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
      cy.visit(`${Cypress.config().baseUrl}/platform/?realm=${realm}#/managed-identities/managed/${resourceType}/${endUserId}`, { timeout: 120000 });
    });
    cy.get('.spinner-border[aria-busy="true"]', { timeout: 15000 }).should('not.exist');
    // The tabs bar scrolls; the tab can be clipped out of view, so click without a visibility gate.
    cy.findByRole('tab', { name: 'Trusted Devices', timeout: 30000 })
      .scrollIntoView()
      .click({ force: true });
    cy.contains('h5', /Browser/i, { timeout: 20000 }).should('be.visible');
  }

  /**
   * The /authenticate response can carry the outcome before the SPA renders
   * it, so the page read must retry rather than sample once. On mismatch,
   * dumps the browser id and the record's saved identifiers for diagnosis.
   */
  static assertAuthReachedOutcome(messageText) {
    cy.get('body', { timeout: 60000 }).then(($body) => {
      if ($body.text().includes(messageText)) {
        DeviceProfileSteps.assertAuthSucceeded(messageText);
        return;
      }
      cy.window({ log: false }).then((win) => {
        cy.log(`assertAuthReachedOutcome mismatch — localStorage FR-SDK-DeviceID: ${win.localStorage.getItem('FR-SDK-DeviceID')}`);
        return readDeviceProfiles(Cypress.env('endUserId')).then((rawProfiles) => {
          cy.log(`saved profile identifiers on record: ${JSON.stringify(parseProfiles(rawProfiles).map((p) => p[PROFILE_IDENTIFIER_FIELD]))}`);
          cy.get('body', { timeout: 60000 }).should('contain.text', messageText).then(() => {
            DeviceProfileSteps.assertAuthSucceeded(messageText);
          });
        });
      });
    });
  }

  /**
   * Types the seeded enduser credentials and submits the login page. The
   * credential reads stay inside the command queue so they cannot race the
   * still-queued user seeding. `deviceId`, when given, is planted into
   * localStorage right before submitting (see reLoginAndAssertMatch).
   */
  static login(outcomeTexts = [], deviceId = undefined) {
    cy.intercept('POST', '**/authenticate*').as('authenticate');
    cy.findByLabelText('User Name', { timeout: 30000 }).should('be.enabled');
    cy.then(() => {
      LoginPage.userNameInput.type(Cypress.env('endUserName'), { force: true });
      LoginPage.passwordInput.first().type(Cypress.env('endUserPassword'), { force: true });
      if (deviceId) {
        cy.window({ log: false }).then((win) => {
          win.localStorage.setItem('FR-SDK-DeviceID', deviceId);
          const stored = win.localStorage.getItem('FR-SDK-DeviceID');
          expect(stored, 'device id planted before submitting login').to.equal(deviceId);
        });
      }
      LoginPage.nextButton.click();
    });
    DeviceProfileSteps.waitForAuthOutcome(outcomeTexts);
  }

  /**
   * Waits for the /authenticate round-trips to reach the journey's visible
   * end. Two endings are accepted: a TextOutputCallback whose text matches
   * one of the expected outcome messages, or a 200 with no callbacks —
   * no callbacks means no new step, so the journey is finished and there
   * is nothing left to wait for.
   */
  static waitForAuthOutcome(outcomeTexts, attemptsLeft = 5) {
    return cy.wait('@authenticate', { timeout: 20000 }).then(({ response }) => {
      const body = response?.body || {};
      const callbacks = body.callbacks || [];
      const textCallbacks = callbacks.filter((callback) => callback?.type === 'TextOutputCallback');
      const reachedMessageNode = textCallbacks.some(
        (callback) => outcomeTexts.some((text) => (callback.output || []).some((o) => o.value === text)),
      );
      const reachedSuccess = response?.statusCode === 200 && callbacks.length === 0;
      if (reachedMessageNode || reachedSuccess) {
        return undefined;
      }
      const detail = JSON.stringify(body.message || body.detail || body).slice(0, 300);
      if (response?.statusCode === 401) {
        throw new Error(`Journey login failed: ${detail}`);
      }
      if (attemptsLeft <= 0) {
        throw new Error(
          'Journey login never settled: no outcome MessageNode and no success in the /authenticate responses. '
          + `Expected one of: [${outcomeTexts.join(' | ')}]. Last response: HTTP ${response?.statusCode} ${detail}`,
        );
      }
      return DeviceProfileSteps.waitForAuthOutcome(outcomeTexts, attemptsLeft - 1);
    });
  }

  /**
   * Confirms the match-outcome MessageNode and asserts the enduser app
   * reached the dashboard. The journey query params are kept by the SPA even
   * after routing, so the URL cannot be used here.
   */
  static assertAuthSucceeded(messageText) {
    MessageNodePage.confirmButton(messageText).click();
    cy.url({ timeout: 20000 }).should('contain', '#/dashboard');
  }

  /**
   * Between-test reset that preserves localStorage (FR-SDK-DeviceID lives there);
   */
  static resetCookiesOnly() {
    cy.clearCookies();
    cy.clearSessionStorage();
    cy.clearAppAuthDatabase();
  }
}
