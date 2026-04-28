/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { recurse } from 'cypress-recurse';
import { retryableBeforeEach } from '@e2e/util';
import { deleteIDMUser } from '@e2e/api/managedApi.e2e';
import {
  putEmailProviderConfig,
  getDefaultProviderConfig,
} from '@e2e/api/emailApi.e2e';
import {
  setEmailProviderConfigByAccount,
  extractLinkFromEmail,
} from '../utils/emailUtils';

describe('Enduser Default Registration', { tags: ['@forgeops', '@smoke'] }, () => {
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

  function validateRequiredField(label, invalidValue, validValue) {
    cy.findByLabelText(label)
      .type(invalidValue)
      .clear()
      .blur();
    cy.get('.error-message').should('contain', 'Please provide a value');

    cy.findByLabelText(label)
      .clear()
      .type(validValue)
      .blur();
    cy.get('.error-message').should('not.exist');
  }

  function validateEmailField(invalidEmail, validEmail) {
    cy.findByLabelText('Email Address')
      .clear()
      .type(invalidEmail)
      .blur();
    cy.get('.error-message').should('contain', 'Invalid email format (example@example.com)');

    cy.findByLabelText('Email Address')
      .clear()
      .type(validEmail)
      .blur();
    cy.get('.error-message').should('not.exist');
  }

  describe('Registration form', () => {
    const locationUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=/&authIndexType=service&authIndexValue=Registration#/`;
    const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
    const userPassword = 'Rg_GRg9k&e';
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

    it('[C19749] incorrect credentials should show error', () => {
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

    it('[TC-12149] next button is disabled until all required fields are filled in', () => {
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
        .type(userPassword);
      cy.findByRole('button', { name: 'Next' })
        .should('be.enabled')
        .click();

      cy.location().should((location) => {
        expect(location.pathname).to.eq('/enduser/');
      });
    });

    it('[TC-12150] validates email and required fields', () => {
      fillOutRegistrationForm(fieldData);

      validateEmailField('invalidEmail', 'valid@example.com');
      validateRequiredField('Username', 'textToBeCleared', userName);
      validateRequiredField('First Name', 'textToBeCleared', 'newTest');
      validateRequiredField('Last Name', 'textToBeCleared', 'User1');
    });
  });
});

describe('Enduser Default Registration', { tags: ['@cloud', '@smoke'] }, () => {
  /**
   * This function is created to select the default security question "What's your favorite color?" And filling the answer field with the word "orange, which is a valid setting for the journey"
   */
  function fillOutKBADefaultColorKBA() {
    cy.findAllByRole('combobox').first().click();
    cy.findAllByText('What\'s your favorite color?').first().click();
    cy.findAllByLabelText('Answer for: What\'s your favorite color?').first().clear().type('orange');
  }

  function fillOutRegistrationForm(fieldData) {
    fieldData.forEach((field) => {
      if (field.placeholder === 'Country') {
        cy.findAllByLabelText(new RegExp(field.placeholder, 'i'), { timeout: 10000 }).first()
          .type(field.text);
      } else {
        cy.findAllByLabelText(new RegExp(field.placeholder, 'i'), { timeout: 10000 }).first()
          .clear()
          .type(field.text);
      }
    });
    fillOutKBADefaultColorKBA();
  }

  describe('Enduser default registration journey, successful registration and negative verifications', () => {
    const locationUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=/alpha&authIndexType=service&authIndexValue=Registration#/`;
    const userPassword = 'Rg_GRg9k&e';
    let emailAccount;
    let validFieldData;

    const getLastEmail = () => {
      recurse(() => cy.task('getLatestEmail', emailAccount),
        Cypress._.isObject, // keep retrying until the task returns an object
        {
          timeout: 5000, // Give up after 3 seconds assuming email will be in inbox by then
          delay: 1000, // Will try a maxium of 5 times
        }).then((email) => {
        cy.wrap(email).as('emailObject');
      });
    };

    before(() => {
      // Initially login to admin
      cy.loginAsAdminCached();

      cy.task('getTestEmailAccount').then((account) => {
        expect(account.user).to.be.a('string');
        emailAccount = account;

        validFieldData = [
          {
            placeholder: 'Username',
            text: emailAccount.user + random(Number.MAX_SAFE_INTEGER),
          },
          {
            placeholder: 'Password',
            text: userPassword,
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

        // Set the default email provider to be the provider of the test account
        // just created
        setEmailProviderConfigByAccount(emailAccount).then((result) => {
          expect(result.status).to.equal(200);
          cy.logout();
        });
      });
    });

    after(() => {
      // Return the email provider back to its default config
      cy.loginAsAdminCached();
      getDefaultProviderConfig().then((config) => {
        putEmailProviderConfig(config.body);
      });
    });

    it('[C19755] Creates new user, sends registration email and logs in', () => {
      // Go to registration journey
      cy.visit(locationUrl);

      fillOutRegistrationForm(validFieldData);
      cy.get('[type="submit"]').click();

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

        // Set up intercept
        cy.intercept('POST', '/am/json/realms/root/realms/alpha/sessions?_action=getSessionInfo').as('getSessionInfo');

        // Visit the link
        cy.visit(registrationLink);

        cy.wait('@getSessionInfo', { timeout: 10000 }).then(({ response }) => {
          cy.wrap(response.body.username).as('userId');
        });

        // We should get redirected to end user
        cy.location().should((location) => {
          expect(location.pathname).to.eq('/enduser/');
        });

        // and be logged in with the registered user
        cy.findByRole('heading', { timeout: 10000 }).contains(`Hello, ${emailAccount.user}`).should('be.visible');

        // The registered username can not be used again
        cy.logout();
        cy.visit(locationUrl);
        fillOutRegistrationForm(validFieldData);
        cy.get('[type="submit"]').click();
        cy.get('.error-message').contains('Invalid username').should('be.visible');

        // Delete created user
        cy.get('@userId').then((userId) => {
          deleteIDMUser(userId);
        });
      });
    });

    it('[TC-12058] Cannot proceed with empty KBA question/answer', () => {
      cy.visit(locationUrl);
      fillOutRegistrationForm(validFieldData);
      cy.get('[type="submit"]').should('be.enabled');
      cy.findAllByLabelText('Answer for: What\'s your favorite color?').first().clear();
      cy.get('[type="submit"]').should('be.disabled');

      // Validate that Submit button is disabled when selecting "Provide your own:" and leaving blank fields
      cy.findAllByRole('combobox').first().click();
      cy.findAllByText('Provide your own:').first().click();
      cy.get('[type="submit"]').should('be.disabled');
      cy.get('.error-message').contains('Please provide a value').should('be.visible');

      // Validate KBA is still invalid with a question and no answer
      cy.findByLabelText('Question').type('RandomString');
      cy.get('.error-message').contains('Please provide a value').should('be.visible');
      cy.get('[type="submit"]').should('be.disabled');

      // Validate KBA is still invalid with an answer and no question
      cy.findByLabelText('Question').clear();
      cy.findByLabelText('Answer').type('RandomString');
      cy.get('.error-message').contains('Please provide a value').should('be.visible');
      cy.get('[type="submit"]').should('be.disabled');

      // Validate valid provided KBA enables Submit button
      cy.findByLabelText('Question').type('RandomString');
      cy.get('.error-message').should('not.exist');
      cy.get('[type="submit"]').should('be.enabled');
    });

    it('[C19754] Terms and Conditions modal is displayed', () => {
      cy.visit(locationUrl);
      cy.findByRole('link', { name: 'Terms & Conditions' }).click();
      cy.findByRole('heading', { name: 'Terms & Conditions' }).should('be.visible');
    });
  });
});
