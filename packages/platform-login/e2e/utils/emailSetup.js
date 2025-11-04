/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getDefaultProviderConfig, putEmailProviderConfig } from '@e2e/api/emailApi.e2e';
import { setEmailProviderConfigByAccount } from './emailUtils';

/**
 * Sets up email testing infrastructure
 * Backs up default email provider and configures test email account
 * This should be called in a before() hook
 */
export const setupEmailTesting = () => {
  // Login as admin first
  cy.loginAsAdmin().then(() => {
    // Backup default email provider
    getDefaultProviderConfig().then((config) => {
      // Store the default config in Cypress environment for later restoration
      Cypress.env('defaultEmailConfig', config.body);
    });
  });

  // Setup testing email provider
  cy.task('getTestEmailAccount').then((account) => {
    expect(account.user).to.be.a('string');

    // Store email account in Cypress environment for later use
    Cypress.env('emailAccount', account);

    // Set the default email provider to be the provider of the test account just created
    setEmailProviderConfigByAccount(account).then((result) => {
      expect(result.status).to.equal(200);
      cy.logout();
    });
  });
};

/**
 * Restores original email provider configuration
 * This should be called in an after() hook
 */
export const teardownEmailTesting = () => {
  const defaultEmailConfig = Cypress.env('defaultEmailConfig');

  if (defaultEmailConfig) {
    // Login as admin and restore the original email provider
    cy.loginAsAdmin().then(() => {
      putEmailProviderConfig(defaultEmailConfig).then((result) => {
        expect(result.status).to.equal(200);
      });
    });
  }
};
