/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
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
const { install, ensureBrowserFlags } = require('@neuralegion/cypress-har-generator');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
// eslint-disable-next-line import/no-unresolved
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');

module.exports = async (on, config) => {
  // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  await addCucumberPreprocessorPlugin(on, config);

  on('file:preprocessor', createBundler({ plugins: [createEsbuildPlugin(config)] }));

  // Install the HAR generator plugin
  install(on);

  on('before:browser:launch', (browser = {}, launchOptions) => {
    // Ensure necessary browser flags for HAR recording if the browser is Chrome
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      // The ensureBrowserFlags function sets the required flags for HAR recording
      // This is necessary because HAR recording relies on specific browser capabilities
      ensureBrowserFlags(browser, launchOptions);
    }

    // Disable video recording if the browser is Firefox as currently it is not supported https://github.com/cypress-io/cypress/issues/18415
    if (browser.name === 'firefox') {
      config.video = false;
    }

    return launchOptions;
  });

  // Dynamically modify the screenshotsFolder and videosFolder based on the browser name
  const browserName = process.env.BROWSER_NAME || 'local';
  config.screenshotsFolder = `e2e/${browserName}/screenshots`;
  config.videosFolder = `e2e/${browserName}/videos`;

  return {
    ...config,
    fixturesFolder: 'e2e/fixtures',
    supportFile: 'e2e/support/index.js',
    hars_folders: 'e2e/hars',
  };
};
