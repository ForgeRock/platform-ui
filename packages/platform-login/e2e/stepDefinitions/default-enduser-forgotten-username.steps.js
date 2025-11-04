/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  Then,
  When,
} from '@badeball/cypress-cucumber-preprocessor';
import { extractLinkFromEmail, getLastEmail } from '../utils/emailUtils';
import { setupEmailTesting, teardownEmailTesting } from '../utils/emailSetup';

/**
 * Before hook to set up email testing infrastructure
 * Backs up default email provider and configures test email account
 */
before(() => {
  if (Cypress.spec.relative.includes('forgotten-username')) {
    setupEmailTesting();
  }
});

/**
 * After hook to restore original email provider configuration
 */
after(() => {
  if (Cypress.spec.relative.includes('forgotten-username')) {
    teardownEmailTesting();
  }
});

When('user retrieves the forgotten username email', () => {
  getLastEmail();
});

When('user navigates to the login link in the forgotten username email', () => {
  cy.get('@emailObject').then((emailObject) => {
    const loginLink = extractLinkFromEmail(emailObject.body);
    cy.visit(loginLink);
  });
});

Then('the forgotten username email contains the correct username and login link', () => {
  cy.get('@emailObject').then((emailObject) => {
    expect(emailObject.headers.subject).to.equal('Account Information - username');
    expect(emailObject.headers.from).to.equal('Test <test@forgerock.com>');
    expect(emailObject.body).contains('Your username is');
    expect(emailObject.body).contains('Click here to login');
  });
});
