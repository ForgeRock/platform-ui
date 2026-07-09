/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { When } from '@badeball/cypress-cucumber-preprocessor';
import { generateJourneyURL } from '@e2e/utils/journeyUtils';

When('user navigates to journey {journey} url with param {string} and value {string}', (journeyName, param, paramValue) => {
  const journeyUrl = generateJourneyURL(journeyName);
  const joureyUrlWithParams = `${journeyUrl}&${param}=${paramValue}`;
  cy.visitJourneyUrl(joureyUrlWithParams);
});

When('cleanup {string} Journey with all dependencies', (journeyName) => {
  const fullJourneyName = `${journeyName}.json`;

  // Delete Imported Journey with all dependencies
  cy.deleteTreesViaAPI([fullJourneyName]);
});
