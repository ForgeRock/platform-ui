/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { JOURNEYS } from '../support/constants';

/**
 * Generates the enduser journey url
 * @param {String} journeyName the journey name based on the ADMIN_PAGES constants file
 * @returns {String} enduser journey url
 */
function generateJourneyURL(journeyName) {
  const journeyPath = Object.values(JOURNEYS).find((journey) => journey.name === journeyName).path;
  const loginRealm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
  return `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=${journeyPath}#/`;
}

export default generateJourneyURL;
