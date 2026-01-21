/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
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
  if (Cypress.spec.relative.includes('password-reset')) {
    setupEmailTesting();
  }
});

/**
 * After hook to restore original email provider configuration
 */
after(() => {
  if (Cypress.spec.relative.includes('password-reset')) {
    teardownEmailTesting();
  }
});

When('user retrieves the password reset email', () => {
  getLastEmail();
});

When('user clicks on the password reset link in the email', () => {
  cy.get('@emailObject').then((emailObject) => {
    const resetLink = extractLinkFromEmail(emailObject.body);
    cy.visit(resetLink);
  });
});

Then('the password reset email contains the link', () => {
  cy.get('@emailObject').then((emailObject) => {
    expect(emailObject.headers.subject).to.equal('Reset your password');
    expect(emailObject.headers.from).to.equal('Test <test@forgerock.com>');
    expect(emailObject.body).contains('Click to reset your password');
    expect(emailObject.body).contains('Password reset link');
  });
});

Then('the password requirements are displayed as:', (dataTable) => {
  const requirements = dataTable.raw();

  requirements.forEach((requirement) => {
    const [name, status] = requirement;
    const isMet = status.toLowerCase() === 'met';

    cy.contains('span[aria-hidden="true"]', name)
      .closest('li')
      .should(isMet ? 'have.class' : 'not.have.class', 'opacity-50');
  });
});
