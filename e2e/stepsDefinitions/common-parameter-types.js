/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { defineParameterType } from '@badeball/cypress-cucumber-preprocessor';
import { ADMIN_PAGES, JOURNEYS } from '../support/constants';

/**
 * Define page parameter type
 * @returns {RegExp} Regular expressión that accepts a string with the page label that appears on the sidebar navigation defined on ADMIN_PAGES constants file.
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
 * @returns {RegExp} Regular expressión that accepts a string with the journey name defined on JOURNEYS constants file.
 */
defineParameterType({
  name: 'journey',
  regexp: new RegExp(`"(${Object.values(JOURNEYS).map((journey) => journey.name).join('|')})"`),
  transformer(journey) {
    return journey;
  },
});
