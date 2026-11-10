/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { prepareJourneyTemplate, journeyCleanupManager } from '@e2e/utils/manageJourneys';
import apiSteps from '@e2e/steps/apiSteps';
import enduser from '../../persona/enduserSteps';
import DeviceProfileSteps from '../../steps/login/DeviceProfileSteps';

const METADATA_JOURNEY_TEMPLATE = 'QA-Device_Profile_template.json';
const LOCATION_JOURNEY_TEMPLATE = 'QA-Device_Profile_Location_template.json';

const OUTCOME_MESSAGES = {
  deviceMatchTrue: 'Device Match Node - TRUE outcome',
  deviceMatchUnknownDevice: 'Device Match Node - UNKNOWN DEVICE outcome',
  deviceLocationMatchTrue: 'Device Location Match Node - TRUE outcome',
};

const CHROMIUM_BROWSERS = ['chrome', 'edge'];

let metadataJourneyFixture;
let locationJourneyFixture;
let metadataOnlyJourneyName;
let locationJourneyName;

/**
 * Grants the geolocation permission to the journey origin over the Chrome
 */
function grantGeolocationPermission() {
  if (!Cypress.isBrowser(CHROMIUM_BROWSERS)) return;
  const origin = `https://${Cypress.env('FQDN')}`;
  cy.wrap(
    Cypress.automation('remote:debugger:protocol', {
      command: 'Browser.grantPermissions',
      params: {
        permissions: ['geolocation'],
        origin,
      },
    }),
  );
}

/**
 * Fixed position per page load
 */
function stubGeolocationPosition() {
  if (!Cypress.isBrowser(CHROMIUM_BROWSERS)) return;
  const position = {
    coords: { latitude: 37.7749, longitude: -122.4194, accuracy: 100 },
    timestamp: Date.now(),
  };
  cy.on('window:before:load', (win) => {
    Object.defineProperty(win.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success) => success(position),
        watchPosition: () => 0,
        clearWatch: () => {},
      },
      configurable: true,
    });
  });
}

/**
 * In local dev mode (proxy_run/pui) the dev server can throw a full screen
 * error page over the app, which Cypress would read instead of the real
 * page — remove it. Never present against a deployed build or in CI.
 */
function removeDevServerOverlay() {
  cy.document({ log: false }).then((doc) => {
    doc.querySelectorAll('#webpack-dev-server-client-overlay')
      .forEach((overlay) => overlay.remove());
  });
}

/**
 * Three random segments joined with '-', matching the SDK's minted-id shape.
 */
function plantedDeviceId() {
  return `${Cypress._.random(1000000000, 4294967295)}-${Cypress._.random(1000000000, 4294967295)}-${Cypress._.random(1000000000, 4294967295)}`;
}

describe('Device profile', { tags: ['@cloud', '@forgeops'] }, () => {
  before(() => {
    const identityResource = Cypress.env('IS_FRAAS') ? 'managed/alpha_user' : 'managed/user';
    metadataJourneyFixture = prepareJourneyTemplate(METADATA_JOURNEY_TEMPLATE, {
      identity_resource: identityResource,
    });
    locationJourneyFixture = prepareJourneyTemplate(LOCATION_JOURNEY_TEMPLATE, {
      identity_resource: identityResource,
    });

    cy.readFixtureFile(metadataJourneyFixture).then((data) => {
      [metadataOnlyJourneyName] = Object.keys(JSON.parse(data).trees);
    });
    cy.readFixtureFile(locationJourneyFixture).then((data) => {
      [locationJourneyName] = Object.keys(JSON.parse(data).trees);
    });

    cy.importTreesViaAPI([metadataJourneyFixture, locationJourneyFixture]);
  });

  after(() => {
    cy.logout();
    apiSteps.user.deleteCreatedUsers();
    cy.loginAsAdminCached();

    [metadataJourneyFixture, locationJourneyFixture].forEach((fixtureName) => {
      journeyCleanupManager.add({ name: fixtureName, fileName: fixtureName });
    });
    apiSteps.journey.deleteImportedJourneys();
  });

  /**
   * Seeds the user and waits until AM can authenticate them.
   */
  function createEndUserAndWait() {
    Cypress.env('deviceProfileDeviceId', undefined);
    apiSteps.user.createEndUser()
      .then(() => DeviceProfileSteps.waitUntilAuthenticatable());
  }

  it('[TC-13633] Saves a new device profile on first login', { browser: CHROMIUM_BROWSERS }, () => {
    createEndUserAndWait();
    enduser.deviceProfile.saveDeviceProfile(metadataOnlyJourneyName, OUTCOME_MESSAGES.deviceMatchUnknownDevice);
    DeviceProfileSteps.assertDeviceVisibleInAdmin();
  });

  it('[TC-13754] Matches device metadata on re-login', { browser: CHROMIUM_BROWSERS }, () => {
    createEndUserAndWait();
    const plantedId = plantedDeviceId();
    enduser.deviceProfile.plantDeviceId(plantedId);
    Cypress.env('deviceProfileDeviceId', plantedId);
    enduser.deviceProfile.saveDeviceProfile(metadataOnlyJourneyName, OUTCOME_MESSAGES.deviceMatchUnknownDevice);
    DeviceProfileSteps.getDeviceId().should('equal', plantedId);
    enduser.deviceProfile.resetCookiesOnly();
    enduser.deviceProfile.reLoginAndAssertMatch(metadataOnlyJourneyName, OUTCOME_MESSAGES.deviceMatchTrue);
  });

  it('[TC-13755] Matches device location on re-login', { browser: CHROMIUM_BROWSERS }, () => {
    grantGeolocationPermission();
    stubGeolocationPosition();
    removeDevServerOverlay();
    createEndUserAndWait();
    const plantedId = plantedDeviceId();
    enduser.deviceProfile.plantDeviceId(plantedId);
    Cypress.env('deviceProfileDeviceId', plantedId);
    enduser.deviceProfile.saveDeviceProfile(locationJourneyName, OUTCOME_MESSAGES.deviceMatchUnknownDevice);
    DeviceProfileSteps.getDeviceId().should('equal', plantedId);
    enduser.deviceProfile.resetCookiesOnly();
    enduser.deviceProfile.reLoginAndAssertMatch(locationJourneyName, OUTCOME_MESSAGES.deviceLocationMatchTrue);
  });
});
