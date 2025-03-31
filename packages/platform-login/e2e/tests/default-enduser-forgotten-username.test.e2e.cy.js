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
  describe.skip('Default ForgottenUsername Journey tests', () => {
    const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';
    const forgotUsernameUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=ForgottenUsername#/`;
    const forgotUsernameLoginUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=ForgottenUsername#/service/Login`;
    const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
    const userPassword = 'Rg_GRg9k&e';
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
          password: userPassword,
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
      cy.visit(forgotUsernameUrl);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Wait for a Journey page to fully load
      cy.findByRole('button', { name: 'Next', timeout: 5000 }).should('be.visible').should('be.disabled');

      // Check correct Journey has loaded
      cy.findByRole('heading', { name: 'Forgotten Username', level: 1 }).should('be.visible');
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

      // Check that we can return to the start of ForgottenUsername Journey page
      cy.go('back');

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Wait for a Journey page to fully load
      cy.findByRole('button', { name: 'Next', timeout: 5000 }).should('be.visible').should('be.disabled');
      // Check correct Journey has loaded
      cy.findByRole('heading', { name: 'Forgotten Username', level: 1, timeout: 10000 }).should('be.visible');
      // Find Sign in link and check its functionality
      cy.findByRole('link', { name: 'Sign in' }).should('be.visible').click();

      // Login as Enduser with password used during creation
      cy.loginAsEnduser(userName, userPassword, true, forgotUsernameLoginUrl);

      // Wait for successfull login
      cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${userName}`).should('be.visible');
    });

    it('Fill in user email, get link from Email, correctly login with the link from recieved email', () => {
      // Fill in account under which testing Enduser is registered
      cy.findByLabelText('Email Address').should('be.visible').type(emailAccount.user, { force: true });

      // Proceed to the next step
      cy.findByRole('button', { name: 'Next' }).should('be.enabled').click();

      // Ensure we are at the suspended stage
      cy.findByText('An email has been sent to the address you entered. Click the link in that email to proceed.').should('be.visible');

      // Get the "Account Information - username" email
      getLastEmail();

      cy.get('@emailObject').then((emailObject) => {
        // Check the "Account Information - username" emails details are as expected
        expect(emailObject.headers.subject).to.equal('Account Information - username');
        expect(emailObject.headers.from).to.equal('Test <test@forgerock.com>');
        expect(emailObject.headers.to).to.equal(emailAccount.user);
        expect(emailObject.body).contains(`Your username is '${userName}'`);
        expect(emailObject.body).contains('Click here to login');

        // Get the registration link from the email
        const loginLink = extractLinkFromEmail(emailObject.body);

        // Visit the Login link from email, heck that Login Journey page is correctly loaded and proceed with user login
        cy.loginAsEnduser(userName, userPassword, true, loginLink);

        // Wait for successfull login
        cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${userName}`).should('be.visible');
      });
    });

    it('Forgot username link works only once', () => {
      // Fill in account under which testing Enduser is registered
      cy.findByLabelText('Email Address').should('be.visible').type(emailAccount.user, { force: true });

      // Proceed to the next step
      cy.findByRole('button', { name: 'Next' }).should('be.enabled').click();

      // Ensure we are at the suspended stage
      cy.findByText('An email has been sent to the address you entered. Click the link in that email to proceed.').should('be.visible');

      // Get the "Account Information - username" email
      getLastEmail();

      cy.get('@emailObject').then((emailObject) => {
        // Get the registration link from the email
        const loginLink = extractLinkFromEmail(emailObject.body);

        // Visit the Login link from email
        cy.visit(loginLink);

        // Wait for a Journey page to fully load
        cy.wait('@themerealmConfig', { timeout: 10000 });

        // We landed on a correct page where user can Login
        cy.findByRole('button', { name: 'Next', timeout: 5000 }).should('be.visible');
        cy.findByRole('heading', { name: 'Sign In', level: 1 }).should('be.visible');

        // Clear cookies
        cy.logout();

        // Visit the Login link from email again
        cy.visit(loginLink);

        // Wait for a Journey page to fully load
        cy.wait('@themerealmConfig', { timeout: 10000 });

        // Link should no longer be working, check correct Error page is shown and we are able to start over
        cy.findByRole('heading', { name: 'Error', level: 1, timeout: 5000 }).should('be.visible');
        cy.findByTestId('FrAlert').should('exist').contains('Unable to resume session. It may have expired.').should('be.visible');
        cy.findByRole('link', { name: 'Start Over' }).should('be.visible').click();

        // Wait for a Journey page to fully load
        cy.wait('@themerealmConfig', { timeout: 10000 });

        // Check the browser has been directed to the ForgottenUsername page
        cy.findByRole('button', { name: 'Next', timeout: 5000 }).should('be.visible').should('be.disabled');
        cy.findByRole('heading', { name: 'Forgotten Username', level: 1 }).should('be.visible');
      });
    });
  });
});
