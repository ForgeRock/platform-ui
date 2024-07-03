/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { putEmailProviderConfig } from '../api/emailApi.e2e';

/**
 * Sets the idm email provider using the details of the test email account passed
 * @param {Object} Email test account details
 * @returns {Promise} The result of the call to set the provider
 */
export const setEmailProviderConfigByAccount = (account) => {
  const emailConfig = {
    _id: 'external.email',
    from: '"Test" <test@forgerock.com>',
    host: account.smtp.host,
    port: account.smtp.port,
    starttls: { enable: true },
    auth: {
      enable: true,
      username: account.user,
      password: account.pass,
    },
    ssl: { enable: false },
    connectiontimeout: 30000,
    debug: false,
    smtpProperties: [],
    threadPoolSize: 20,
    timeout: 30000,
    writetimeout: 30000,
  };

  return putEmailProviderConfig(emailConfig);
};

/**
 * Attempts to extract a link from an emails content
 * @param {String} emailContent
 * @returns {String} The extracted href
 */
export const extractLinkFromEmail = (emailContent) => {
  const el = document.createElement('div');
  el.innerHTML = emailContent;
  const link = el.querySelector('a');

  if (!link) {
    return false;
  }

  return link.getAttribute('href');
};
