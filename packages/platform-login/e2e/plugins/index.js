/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const { install } = require('@neuralegion/cypress-har-generator');
const {
  createEmailAccount,
  getLatestEmail,
} = require('./email-account');

module.exports = (on, config) => {
  install(on);

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

  return {
    ...config,
    fixturesFolder: 'e2e/fixtures',
    screenshotsFolder: 'e2e/screenshots',
    videosFolder: 'e2e/videos',
    supportFile: 'e2e/support/index.js',
    hars_folders: 'e2e/hars',
  };
};
