/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import '@e2e/support';

Cypress.on('window:before:load', (window) => {
  Object.defineProperty(window.navigator, 'language', { value: Cypress.env('LOCALE') });
  Object.defineProperty(window.navigator, 'languages', { value: Cypress.env('LOCALESLIST') });
});
