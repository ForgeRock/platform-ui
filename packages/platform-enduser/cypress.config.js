/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  chromeWebSecurity: false,
  experimentalWebKitSupport: true,
  experimentalMemoryManagement: true,
  video: true,
  retries: 3,
  reporter: '../../node_modules/mochawesome',
  reporterOptions: {
    overwrite: false,
    html: false,
    json: true,
  },
  env: {
    lighthousePassThreshold: {
      performance: 0.75,
      accessibility: 0.75,
      'best-practices': 0.75,
    },
    hars_folders: 'e2e/hars',
  },
  fixturesFolder: 'e2e/fixtures',
  screenshotsFolder: 'e2e/screenshots',
  videosFolder: 'e2e/videos',
  e2e: {
    async setupNodeEvents(on, config) {
      return require('./e2e/plugins/index.js')(on, config); // eslint-disable-line global-require
    },
    excludeSpecPattern: ['lighthouse.suite.cy.js'],
    specPattern: 'e2e/tests/**/*.{js,feature}',
    supportFile: 'e2e/support/index.js',
  },
});
