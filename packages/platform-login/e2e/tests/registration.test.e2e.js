/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';

function fillOutRegistrationForm(fieldData) {
  fieldData.forEach((field) => {
    cy.findByPlaceholderText(field.placeholder)
      .clear()
      .type(field.text);
  });

  cy.findAllByRole('combobox').first().click();
  cy.findAllByText('What\'s your favorite color?').first().click();
  cy.findAllByPlaceholderText('Answer').first().clear().type('orange');
  cy.findAllByRole('combobox').last().click();
  cy.findAllByText('Who was your first employer?').last().click();
  cy.findAllByPlaceholderText('Answer').last().clear().type('ForgeRock');
}

filterTests(['forgeops'], () => {
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
      cy.findByPlaceholderText('Password')
        .type('2short');

      cy.get('li:contains("Must be at least 8 characters long")')
        .should('not.have.class', 'fr-valid');

      cy.findByPlaceholderText('Password')
        .type('longenoughtopass');

      cy.get('li:contains("Must be at least 8 characters long")')
        .should('have.class', 'fr-valid');
    });

    it('creates new user and logs in', () => {
      fillOutRegistrationForm(fieldData);
      // set valid password - submit form
      cy.findByPlaceholderText('Password')
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
      cy.findByPlaceholderText('Username')
        .type('1');
      cy.findByRole('button', { name: 'Next' })
        .should('be.disabled');
      cy.findByPlaceholderText('Password')
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
