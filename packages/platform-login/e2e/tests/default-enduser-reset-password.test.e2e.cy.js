/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { recurse } from 'cypress-recurse';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import { setEmailProviderConfigByAccount, extractLinkFromEmail } from '../utils/emailUtils';
import { putEmailProviderConfig, getDefaultProviderConfig } from '../api/emailApi.e2e';

filterTests(['@forgeops', '@cloud'], () => {
  describe.skip('Default ResetPassword Journey tests', () => {
    const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';
    const resetPasswordUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=ResetPassword#/`;
    const resetPasswordLoginUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=ResetPassword#/service/Login`;
    const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
    const defaultPassword = 'Rg_GRg9k&e';
    const resetPassword = defaultPassword.split('').reverse().join('');
    let userId;
    let emailAccount;
    let defaulEmailConfig;

    const getLastEmail = () => {
      // Keep retrying until the task returns an object
      recurse(() => cy.task('getLatestEmail', emailAccount), Cypress._.isObject, {
        timeout: 3000, // Give up after 3 seconds assuming email will be in inbox by then
        delay: 1000, // Will try a maximum of 3 times
      }).then((email) => {
        cy.wrap(email).as('emailObject');
      });
    };

    before(() => {
      // Login as admin
      cy.loginAsAdmin().then(() => {
        // Backup default email provider
        getDefaultProviderConfig().then((config) => {
          defaulEmailConfig = config.body;
        });
      });

      // Setup testing email provider
      cy.task('getTestEmailAccount').then((account) => {
        expect(account.user).to.be.a('string');
        emailAccount = account;

        // Set the default email provider to be the provider of the test account just created
        setEmailProviderConfigByAccount(emailAccount).then((result) => {
          expect(result.status).to.equal(200);
          cy.logout();
        });
      });

      // Create testing IDM enduser
      cy.log('Create new IDM Enduser').then(() => {
        createIDMUser({
          userName,
          password: defaultPassword,
          givenName: userName,
          sn: 'test',
          mail: emailAccount.user,
        }).then((result) => {
          expect(result.status).to.equal(201);
          userId = result.body._id;

          cy.logout();
        });
      });
    });

    retryableBeforeEach(() => {
      // Set up intercept
      cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

      // Load base Journey URL
      cy.visit(resetPasswordUrl);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Wait for a Journey page to fully load
      cy.findByRole('button', { name: 'Next', timeout: 5000 }).should('be.visible').should('be.disabled');

      // Check correct Journey has loaded
      cy.findByRole('heading', { name: 'Reset Password', level: 1 }).should('be.visible');
    });

    after(() => {
      // Login as admin, delete testing IDM enduser and return the email provider back to its default config
      cy.loginAsAdmin().then(() => {
        deleteIDMUser(userId);

        // Put back default email provider
        putEmailProviderConfig(defaulEmailConfig).then((result) => {
          expect(result.status).to.equal(200);
        });
      });
    });

    it('Sign In link redirects to default Login Journey and works correctly', () => {
      // Find Sign in link and check its functionality
      cy.findByRole('link', { name: 'Sign in' }).click();

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Check the browser has been directed to the default Login page
      cy.findByRole('button', { name: 'Next', timeout: 5000 }).should('be.visible');
      cy.findByRole('heading', { name: 'Sign In', level: 1 }).should('be.visible');

      // Check that we can return to the start of ResetPassword Journey page
      cy.go('back');

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Wait for a Journey page to fully load
      cy.findByRole('button', { name: 'Next', timeout: 5000 }).should('be.visible').should('be.disabled');
      // Check correct Journey has loaded
      cy.findByRole('heading', { name: 'Reset Password', level: 1, timeout: 10000 }).should('be.visible');
      // Find Sign in link and check its functionality
      cy.findByRole('link', { name: 'Sign in' }).should('be.visible').click();

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Login as Enduser with password used during creation
      cy.loginAsEnduser(userName, defaultPassword, true, resetPasswordLoginUrl);

      // Wait for successfull login
      cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${userName}`).should('be.visible');
    });

    it('Reset user password, get link from Email, finish resetting password and check new password is correctly set for subsequent logins', () => {
      // Fill in account under which testing Enduser is registered
      cy.findByLabelText('Email Address').should('be.visible').type(emailAccount.user, { force: true });

      // Proceed to the next step
      cy.findByRole('button', { name: 'Next' }).should('be.enabled').click();

      // Ensure we are at the suspended stage
      cy.findByText('An email has been sent to the address you entered. Click the link in that email to proceed.').should('be.visible');

      // Get the "Reset your password" email
      getLastEmail();

      cy.get('@emailObject').then((emailObject) => {
        // Check the "Reset your password" emails details are as expected
        expect(emailObject.headers.subject).to.equal('Reset your password');
        expect(emailObject.headers.from).to.equal('Test <test@forgerock.com>');
        expect(emailObject.headers.to).to.equal(emailAccount.user);
        expect(emailObject.body).contains('Click to reset your password');
        expect(emailObject.body).contains('Password reset link');

        // Get the registration link from the email
        const resetLink = extractLinkFromEmail(emailObject.body);

        // Visit the Password reset link from email
        cy.visit(resetLink);

        // Wait for a Journey page to fully load
        cy.wait('@themerealmConfig', { timeout: 10000 });
        cy.findByRole('button', { name: 'Next', timeout: 5000 }).should('be.visible').should('be.disabled');

        // We landed on a correct page where user can reset its password
        cy.findByRole('heading', { name: 'Reset Password', level: 1 }).should('be.visible');

        // Make sure password requirements are fully loaded (Journey won't work without password requirements being shown and they might load after Next button is visible)
        cy.findByText('Must be at least 8 characters long').should('be.visible');
        if (!Cypress.env('IS_FRAAS')) {
          cy.findByText('Must have at least 1 capital letter(s)').should('be.visible');
          cy.findByText('Must have at least 1 number(s)').should('be.visible');
        } else {
          cy.findByText('One lowercase character, one uppercase character, one number, one special character').should('be.visible');
        }

        // Type in password to reset to
        cy.findByLabelText('Password').should('be.visible').type(resetPassword, { force: true });

        // Proceed to the next step
        cy.findByRole('button', { name: 'Next' }).should('be.enabled').click();

        // We should get redirected to end user
        cy.location().should((location) => {
          expect(location.pathname).to.eq('/enduser/');
        });

        // Wait for successfull login
        cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${userName}`).should('be.visible');
      });

      // Logout enduser to check old password does no longer work and new password is sucessfully set
      cy.logout();

      // Try to login with old password that should no longer work
      cy.loginAsEnduser(userName, defaultPassword, false);
      if (!Cypress.env('IS_FRAAS')) {
        cy.findByTestId('FrAlert').should('exist').contains('Login failure').should('be.visible');
      }

      // Try to login with new password that should be correctly set
      cy.loginAsEnduser(userName, resetPassword);

      // Wait for successfull login
      cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${userName}`).should('be.visible');
    });

    it('Reset password link works only once', () => {
      // Fill in account under which testing Enduser is registered
      cy.findByLabelText('Email Address').should('be.visible').type(emailAccount.user, { force: true });

      // Proceed to the next step
      cy.findByRole('button', { name: 'Next' }).should('be.enabled').click();

      // Ensure we are at the suspended stage
      cy.findByText('An email has been sent to the address you entered. Click the link in that email to proceed.').should('be.visible');

      // Get the "Reset your password" email
      getLastEmail();

      cy.get('@emailObject').then((emailObject) => {
        // Get the registration link from the email
        const resetLink = extractLinkFromEmail(emailObject.body);

        // Visit the Password reset link from email
        cy.visit(resetLink);

        // Wait for a Journey page to fully load
        cy.wait('@themerealmConfig', { timeout: 10000 });

        // We landed on a correct page where user can reset its password
        cy.findByRole('button', { name: 'Next', timeout: 5000 }).should('be.visible').should('be.disabled');
        cy.findByRole('heading', { name: 'Reset Password', level: 1 }).should('be.visible');

        // Clear cookies
        cy.logout();

        // Visit the Password reset link from email again
        cy.visit(resetLink);

        // Wait for a Journey page to fully load
        cy.wait('@themerealmConfig', { timeout: 10000 });

        // Link should no longer be working, check correct Error page is shown and we are able to start over
        cy.findByRole('heading', { name: 'Error', level: 1, timeout: 5000 }).should('be.visible');
        cy.findByTestId('FrAlert').should('exist').contains('Unable to resume session. It may have expired.').should('be.visible');
        cy.findByRole('link', { name: 'Start Over' }).should('be.visible').click();

        // Wait for a Journey page to fully load
        cy.wait('@themerealmConfig', { timeout: 10000 });

        // Check the browser has been directed to the ResetPassword page
        cy.findByRole('button', { name: 'Next', timeout: 5000 }).should('be.visible').should('be.disabled');
        cy.findByRole('heading', { name: 'Reset Password', level: 1 }).should('be.visible');
      });
    });
  });
});
