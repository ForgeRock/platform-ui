/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { retryableBeforeEach } from '@e2e/util';
import { prepareJourneyTemplate } from '@e2e/utils/manageJourneys';
import TheaterLayoutPage from '@e2e/pages/login/TheaterLayoutPage';
import TheaterModeSteps from '../../steps/login/TheaterModeSteps';

const IDP_PROVIDER = 'Google';
// Strong random suffix per run: two concurrent runs against the same
// tenant would otherwise delete each other's tree in after().
const treeSuffix = Cypress._.random(Number.MAX_SAFE_INTEGER);
let journeyFixture;
let journeyName;

describe('Theater mode', { tags: ['@cloud'] }, () => {
  before(() => {
    journeyFixture = prepareJourneyTemplate('IAM-12292_template.json', { treeSuffix });
    cy.readFixtureFile(journeyFixture).then((data) => {
      [journeyName] = Object.keys(JSON.parse(data).trees);
    });
    cy.importTreesViaAPI([journeyFixture]);
    cy.logout();
  });

  afterEach(() => TheaterModeSteps.cleanupTheaterTheme());

  after(() => {
    if (!journeyFixture) return;
    cy.deleteTreesViaAPI([journeyFixture]);
  });

  retryableBeforeEach(() => {
    TheaterModeSteps.setupTheaterTheme(journeyName);
    TheaterModeSteps.visitTheaterJourney(journeyName);
  });

  it('[C13263] Verify visibility of IDP login button in theatre mode', () => {
    TheaterLayoutPage.journeyCard.should('be.visible');
    TheaterModeSteps.assertIdpButtonVisibleInJourneyCard(IDP_PROVIDER);
  });
});
