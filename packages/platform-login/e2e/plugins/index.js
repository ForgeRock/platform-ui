/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const { install, ensureBrowserFlags } = require('@neuralegion/cypress-har-generator');
const cucumber = require('cypress-cucumber-preprocessor').default;
const {
  createEmailAccount,
  getLatestEmail,
} = require('./email-account');

module.exports = (on, config) => {
  on('file:preprocessor', cucumber());

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

  on('task', {
    async getTestEmailAccount() {
      const account = await createEmailAccount();
      return account;
    },
    async getLatestEmail(emailAccount) {
      const email = await getLatestEmail(emailAccount);
      return email;
    },
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
