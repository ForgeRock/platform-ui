/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor');
const { ensureBrowserFlags } = require('@neuralegion/cypress-har-generator');
const { default: got } = require('got');
const { install } = require('@neuralegion/cypress-har-generator');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const fs = require('fs').promises;
const { createEmailAccount, getLatestEmail } = require('./email-account');

module.exports = async (on, config) => {
  await addCucumberPreprocessorPlugin(on, config);

  on('file:preprocessor', createBundler({ plugins: [createEsbuildPlugin(config)] }));

  on('task', {
    async readFileWithFallback({ globalFile, projectFile, encoding = 'utf8' }) {
      try {
        const data = await fs.readFile(globalFile, encoding);
        return data.toString();
      } catch (error) {
        try {
          const data = await fs.readFile(projectFile, encoding);
          return data.toString();
        } catch (fallbackError) {
          return null;
        }
      }
    },
  });

  on('task', {
    async authenticateUser({
      domain, userName, password, isFraas,
    }) {
      const authRealm = isFraas ? 'alpha' : 'root';
      const response = await got(`https://${domain}/am/json/realms/${authRealm}/authenticate`, {
        method: 'POST',
        headers: {
          'X-OpenAM-Username': userName,
          'X-OpenAM-Password': password,
          'Accept-API-Version': 'resource=2.0, protocol=1.0',
        },
        throwHttpErrors: false,
      });

      return response.statusCode;
    },
    async authenticateAgent({
      domain, userName, password, isFraas,
    }) {
      const authRealm = isFraas ? 'alpha' : 'root';
      // Will this be needed for the Cloud or will chain changes also apply there after AM image gets promoted?
      const authMethod = isFraas ? 'authIndexType=module&authIndexValue=Application' : 'authIndexType=service&authIndexValue=Agent';
      const response = await got(`https://${domain}/am/json/realms/${authRealm}/authenticate?${authMethod}`, {
        method: 'POST',
        headers: {
          'X-OpenAM-Username': userName,
          'X-OpenAM-Password': password,
          'Accept-API-Version': 'resource=2.0, protocol=1.0',
        },
        throwHttpErrors: false,
      });

      return response.statusCode;
    },
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
