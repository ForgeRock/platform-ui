/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

// `on` is used to hook into various events Cypress emits
// `config` is the resolved Cypress config
const { install } = require('@neuralegion/cypress-har-generator');

module.exports = (on, config) => {
  install(on);

  return {
    ...config,
    fixturesFolder: 'e2e/fixtures',
    screenshotsFolder: 'e2e/screenshots',
    videosFolder: 'e2e/videos',
    supportFile: 'e2e/support/index.js',
    hars_folders: 'e2e/hars',
  };
};
