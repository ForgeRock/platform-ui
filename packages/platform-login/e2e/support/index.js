/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
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

const { register: registerCypressGrep } = require('@cypress/grep');

// Only apply grep filtering to .cy.js files. .feature files are filtered
// by the cucumber preprocessor via CYPRESS_TAGS — registering grep for them
// would cause scenarios to be skipped when CYPRESS_grepTags is set.
if (!Cypress.spec.relative.endsWith('.feature')) {
  registerCypressGrep();
}
