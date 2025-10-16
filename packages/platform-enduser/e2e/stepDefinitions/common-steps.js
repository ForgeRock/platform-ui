/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Given } from '@badeball/cypress-cucumber-preprocessor';

Given('browser locale is set to {string}', (locale) => {
  const localesList = locale.split(',');
  Cypress.env('LOCALESLIST', localesList);
  Cypress.env('LOCALE', localesList[0]);
});
