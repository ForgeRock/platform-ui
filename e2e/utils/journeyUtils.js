/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { JOURNEYS } from '../support/constants';
import { prepareJourneyTemplate } from './manageJourneys';

/**
 * Generates the enduser journey url
 * @param {String} journeyName the journey name based on the JOURNEYS constants file
 * @returns {String} enduser journey url
 */
export function generateJourneyURL(journeyName) {
  const journeyPath = Object.values(JOURNEYS).find((journey) => journey.name === journeyName).path;
  const loginRealm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
  return `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=${journeyPath}`;
}

/**
 * Generates the journey file name based on the enviroment.
 * It validates if the journey name is a template file or there are two different files for each enviroment.
 * @param {String} journeyName the journey name based on the JOURNEYS constants file
 * @returns {String} journey filename based on the environment
 */
export function generateJourneyFileName(journeyName) {
  const journeyFileName = Object.values(JOURNEYS).find((journey) => journey.name === journeyName).fileName;
  if (journeyFileName.includes('_template')) {
    const identityResourceValue = Cypress.env('IS_FRAAS') ? 'managed/alpha_user' : 'managed/user';
    return prepareJourneyTemplate(`${journeyFileName}.json`, { identity_resource: identityResourceValue });
  }
  return `${journeyFileName}_${Cypress.env('IS_FRAAS') ? 'Cloud' : 'ForgeOps'}.json`;
}
