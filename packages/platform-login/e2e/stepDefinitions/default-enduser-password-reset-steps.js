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

    cy.intercept(
      {
        url: '**/am/json/realms/root/**/authenticate*authIndexValue=ResetPassword',
        method: 'POST',
        times: 1,
      },
    ).as('serviceResetPassword');

    cy.intercept(
      {
        url: '**/am/json/realms/root/**/authenticate',
        method: 'POST',
        times: 2,
      },
    ).as('validatedCreatePasswordCallback');

    cy.visit(resetLink);

    cy.wait('@serviceResetPassword').then((interception) => {
      if (interception.response?.statusCode === 200) {
        // If the resetPassword call was successful we should get two
        // requests for createPasswordCallback to display the password
        // validation rules. Users will wait for those to be rendered so tests
        // can wait as well. Too fast and we'll press Next before it is disabled.
        cy.wait('@validatedCreatePasswordCallback');
        cy.wait('@validatedCreatePasswordCallback');
      }
    });
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
