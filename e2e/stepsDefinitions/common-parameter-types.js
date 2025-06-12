/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { defineParameterType } from '@badeball/cypress-cucumber-preprocessor';
import { ADMIN_PAGES, JOURNEYS } from '../support/constants';

/**
 * Define page parameter type
 * @returns {RegExp} Regular expression that accepts a string with the page label that appears on the sidebar navigation defined on ADMIN_PAGES constants file.
 */
defineParameterType({
  name: 'page',
  regexp: new RegExp(`"(${Object.values(ADMIN_PAGES).map((page) => page.label).join('|')})"`),
  transformer(page) {
    return page;
  },
});

/**
 * Define journey parameter type
 * @returns {RegExp} Regular expression that accepts a string with the journey name defined on JOURNEYS constants file.
 */
defineParameterType({
  name: 'journey',
  regexp: new RegExp(`"(${Object.values(JOURNEYS).map((journey) => journey.name).join('|')})"`),
  transformer(journey) {
    return journey;
  },
});
