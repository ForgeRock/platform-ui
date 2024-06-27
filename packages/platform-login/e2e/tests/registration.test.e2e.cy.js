/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { recurse } from 'cypress-recurse';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';
import {
  setEmailProviderConfigByAccount,
  extractLinkFromEmail,
} from '../utils/emailUtils';
import {
  putEmailProviderConfig,
  getDefaultProviderConfig,
} from '../api/emailApi.e2e';

filterTests(['forgeops'], () => {
  function fillOutRegistrationForm(fieldData) {
    fieldData.forEach((field) => {
      cy.findByLabelText(field.placeholder)
        .clear()
        .type(field.text);
    });

    cy.findAllByRole('combobox').first().click();
    cy.findAllByText('What\'s your favorite color?').first().click();
    cy.findAllByLabelText('Answer for: What\'s your favorite color?').first().clear().type('orange');
    cy.findAllByRole('combobox').last().click();
    cy.findAllByText('Who was your first employer?').last().click();
    cy.findAllByLabelText('Answer for: Who was your first employer?').last().clear().type('ForgeRock');
  }

  describe('Registration form', () => {
    const locationUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=/&authIndexType=service&authIndexValue=Registration#/`;
    const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
    const fieldData = [
      {
        placeholder: 'Username',
        text: userName,
      },
      {
        placeholder: 'First Name',
        text: 'newTest',
      },
      {
        placeholder: 'Last Name',
        text: 'User1',
      },
      {
        placeholder: 'Email Address',
        text: 'newTestUser1@test.com',
      },
    ];

    retryableBeforeEach(() => {
      cy.visit(locationUrl);
    });

    it('incorrect credentials should show error', () => {
      fillOutRegistrationForm(fieldData);
      // set short and long passwords - check policy
      cy.findByLabelText('Password')
        .type('2short');

      cy.get('li:contains("Must be at least 8 characters long")')
        .should('not.have.class', 'fr-valid');

      cy.findByLabelText('Password')
        .type('longenoughtopass');

      cy.get('li:contains("Must be at least 8 characters long")')
        .should('have.class', 'fr-valid');
    });

    it('creates new user and logs in', () => {
      fillOutRegistrationForm(fieldData);
      // set valid password - submit form
      cy.findByLabelText('Password')
        .type('Welcome1')
        .get('[type="submit"]')
        .click();

      cy.location().should((location) => {
        expect(location.pathname).to.eq('/enduser/');
      });
    });

    it('next button is disabled until all required fields are filled in', () => {
      const onlyUserName = [
        {
          placeholder: 'Username',
          text: userName,
        },
      ];
      cy.findByRole('button', { name: 'Next' })
        .should('be.disabled');
      fillOutRegistrationForm(onlyUserName);
      cy.findByRole('button', { name: 'Next' })
        .should('be.disabled');
      fillOutRegistrationForm(fieldData);
      cy.findByLabelText('Username')
        .type('1');
      cy.findByRole('button', { name: 'Next' })
        .should('be.disabled');
      cy.findByLabelText('Password')
        .type('Welcome1');
      cy.findByRole('button', { name: 'Next' })
        .should('be.enabled')
        .click();

      cy.location().should((location) => {
        expect(location.pathname).to.eq('/enduser/');
      });
    });
  });
});

filterTests(['cloud'], () => {
  function fillOutRegistrationForm(fieldData) {
    fieldData.forEach((field) => {
      cy.findByLabelText(field.placeholder)
        .clear()
        .type(field.text);
    });

    cy.findAllByRole('combobox').first().click();
    cy.findAllByText('What\'s your favorite color?').first().click();
    cy.findAllByLabelText('Answer for: What\'s your favorite color?').first().clear().type('orange');

    cy.get('[type="submit"]').click();
  }

  describe('Registration form', () => {
    const locationUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=/alpha&authIndexType=service&authIndexValue=Registration#/`;
    let emailAccount;

    const getLastEmail = () => {
      recurse(() => cy.task('getLatestEmail', emailAccount),
        Cypress._.isObject, // keep retrying until the task returns an object
        {
          timeout: 3000, // Give up after 3 seconds assuming email will be in inbox by then
          delay: 1000, // Will try a maximum of 3 times
        }).then((email) => {
        cy.wrap(email).as('emailObject');
      });
    };

    beforeEach(() => {
      // Initially login to admin
      cy.login();

      cy.task('getTestEmailAccount').then((account) => {
        expect(account.user).to.be.a('string');
        emailAccount = account;

        // Set the default email provider to be the provider of the test account
        // just created
        setEmailProviderConfigByAccount(emailAccount).then((result) => {
          expect(result.status).to.equal(200);
          cy.logout();
        });
      });
    });

    afterEach(() => {
      // Return the email provider back to its default config
      cy.login();
      getDefaultProviderConfig().then((config) => {
        putEmailProviderConfig(config);
      });
    });

    it('creates new user, sends registration email and logs in', () => {
      // Go to registration journey
      cy.visit(locationUrl);

      const fieldData = [
        {
          placeholder: 'Username',
          text: emailAccount.user,
        },
        {
          placeholder: 'Password',
          text: 'Password_1',
        },
        {
          placeholder: 'First Name',
          text: emailAccount.user,
        },
        {
          placeholder: 'Last Name',
          text: emailAccount.user,
        },
        {
          placeholder: 'Email Address',
          text: emailAccount.user,
        },
      ];

      fillOutRegistrationForm(fieldData);

      // Ensure we are at the suspended stage
      cy.findByTestId('suspend-text-output').contains('An email has been sent to the address you entered. Click the link in that email to proceed.');

      // Get the registration email just sent
      getLastEmail();

      cy.get('@emailObject').then((emailObject) => {
        // Check the emails details are as expected
        expect(emailObject.headers.subject).to.equal('Register new account');
        expect(emailObject.headers.from).to.equal('Test <test@forgerock.com>');
        expect(emailObject.headers.to).to.equal(emailAccount.user);
        expect(emailObject.body).contains('Email verification link');

        // Get the registration link from the email
        const registrationLink = extractLinkFromEmail(emailObject.body);

        // Visit the link
        cy.visit(registrationLink);

        // We should get redirected to end user
        cy.location().should((location) => {
          expect(location.pathname).to.eq('/enduser/');
        });

        // and be logged in with the registered user
        cy.findByTestId('dashboard-welcome-greeting').contains(`Hello, ${emailAccount.user}`);
      });
    });
  });
});
