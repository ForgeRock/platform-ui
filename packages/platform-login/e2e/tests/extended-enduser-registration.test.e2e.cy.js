/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';

filterTests(['@cloud'], () => {
  function fillOutRegistrationForm(fieldData) {
    fieldData.forEach((field) => {
      cy.findByText(field.placeholder, { timeout: 10000 })
        .siblings('input')
        .clear()
        .type(field.text);
    });
  }

  describe('Enduser extended registration journey without suspend node and with all nodes options on', () => {
    const realmUrl = Cypress.env('IS_FRAAS') ? '/realms/alpha' : '';
    const locationUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=alpha&authIndexType=service&authIndexValue=QA%20-%20Extended%20Registration`;
    const validFieldData = [
      {
        placeholder: 'Username',
        text: random(Number.MAX_SAFE_INTEGER),
      },
      {
        placeholder: 'Password',
        text: 'Valid.1Pass',
      },
      {
        placeholder: 'First Name',
        text: random(Number.MAX_SAFE_INTEGER),
      },
      {
        placeholder: 'Last Name',
        text: random(Number.MAX_SAFE_INTEGER),
      },
      {
        placeholder: 'Email Address',
        text: 'enduser@testing.email',
      },
      {
        placeholder: 'Description',
        text: 'Description for Enduser',
      },
      {
        placeholder: 'Telephone Number',
        text: '3008756123',
      },
      {
        placeholder: 'Address 1',
        text: 'Cra. 44 #30 - 27',
      },
      {
        placeholder: 'Postal Code',
        text: '05001',
      },
      {
        placeholder: 'City',
        text: 'Medellín',
      },
      {
        placeholder: 'Country',
        text: 'Colombia',
      },
      {
        placeholder: 'Date Of Birth',
        text: '1999-03-06',
      },
      {
        placeholder: 'Confirm Password',
        text: 'Valid.1Pass',
      },
    ];

    function openExtendedRegistrationJourneyPage() {
      // Set up intercepts
      cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');
      cy.intercept('POST', `/am/json/realms/root${realmUrl}/authenticate`).as('authenticate');

      // Redirect to the Extended Registration Journey page
      cy.visit(locationUrl);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });
      cy.wait('@authenticate', { timeout: 5000 });
      cy.wait('@authenticate', { timeout: 5000 });
    }

    before(() => {
      // Login as admin, import prepared Extended registration journey and logout
      cy.importTreesViaAPI(['QA-Extended_Registration.json']);
      cy.logout();
    });

    retryableBeforeEach(() => {
      openExtendedRegistrationJourneyPage();
    });

    it('Creates new user, sends registration email and logs in', () => {
      // Submit button is disabled when navigating to the journey
      cy.findByRole('button', { name: 'Next' }).should('be.disabled');

      // Submit button is enabled
      fillOutRegistrationForm(validFieldData);
      cy.findByRole('button', { name: 'Next' }).should('be.enabled').click();

      // Successful registration and login
      cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${validFieldData[2].text}`).should('be.visible');

      // Used data is displayed in the user profile
      cy.findByRole('link', { name: 'Profile' }).click();
      cy.findByRole('button', { name: 'Edit Personal Info' }).click();
      cy.findByRole('textbox', { name: 'Username' }).should('have.value', validFieldData[0].text);
      cy.findByRole('textbox', { name: 'First Name' }).should('have.value', validFieldData[2].text);
      cy.findByRole('textbox', { name: 'Last Name' }).should('have.value', validFieldData[3].text);
      cy.findByRole('textbox', { name: 'Email Address' }).should('have.value', validFieldData[4].text);
      cy.findByRole('textbox', { name: 'Description (optional)' }).should('have.value', validFieldData[5].text);
      cy.findByRole('textbox', { name: 'Telephone Number (optional)' }).should('have.value', validFieldData[6].text);
      cy.findByRole('textbox', { name: 'Address 1 (optional)' }).should('have.value', validFieldData[7].text);
      cy.findByRole('textbox', { name: 'Postal Code (optional)' }).should('have.value', validFieldData[8].text);
      cy.findByRole('textbox', { name: 'City (optional)' }).should('have.value', validFieldData[9].text);
      cy.findByRole('textbox', { name: 'Country (optional)' }).should('have.value', validFieldData[10].text);

      // The registered username can not be used again
      cy.logout();

      openExtendedRegistrationJourneyPage();
      fillOutRegistrationForm(validFieldData);
      cy.findByRole('button', { name: 'Next' }).click();
      cy.get('.error-message').contains('Invalid username').should('be.visible');
    });

    it('User can not proceed with empty or incorrect values', () => {
      validFieldData[0].text = `enduser${random(Number.MAX_SAFE_INTEGER)}`;
      fillOutRegistrationForm(validFieldData);

      // Verify that user can not register with empty description
      cy.findByText('Description').siblings('input').clear();
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findByTestId('FrAlert').should('be.visible').and('contain.text', 'Invalid Attribute Syntax');

      // Verify that user can not register with empty telephone number
      fillOutRegistrationForm(validFieldData);
      cy.findByText('Telephone Number').siblings('input').clear();
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findByTestId('FrAlert').should('be.visible').and('contain.text', 'Invalid Attribute Syntax');

      // Verify that user can not register with an alpha-numeric telephone number
      fillOutRegistrationForm(validFieldData);
      cy.findByText('Telephone Number').siblings('input').clear().type('3008756123a');
      cy.findByRole('button', { name: 'Next' }).click();
      cy.get('.error-message').contains('Has to match pattern: ^\\+?([0-9\\- \\(\\)])*$').should('be.visible');

      // Verify that user can not register with empty address
      fillOutRegistrationForm(validFieldData);
      cy.findByText('Address 1').siblings('input').clear();
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findByTestId('FrAlert').should('be.visible').and('contain.text', 'Invalid Attribute Syntax');

      // Verify that user can not register with empty postal code
      fillOutRegistrationForm(validFieldData);
      cy.findByText('Postal Code').siblings('input').clear();
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findByTestId('FrAlert').should('be.visible').and('contain.text', 'Invalid Attribute Syntax');

      // Verify that user can not register with empty city
      fillOutRegistrationForm(validFieldData);
      cy.findByText('City').siblings('input').clear();
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findByTestId('FrAlert').should('be.visible').and('contain.text', 'Invalid Attribute Syntax');

      // Verify that user can not register with empty country
      fillOutRegistrationForm(validFieldData);
      cy.findByText('Country').siblings('input').clear();
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findByTestId('FrAlert').should('be.visible').and('contain.text', 'Invalid Attribute Syntax');
    });

    it('Double password validation works correctly', () => {
      fillOutRegistrationForm(validFieldData);

      // User can not proceed with empty confirm password
      cy.findByText('Confirm Password').siblings('input').clear();
      cy.findByRole('button', { name: 'Next' }).should('be.disabled');

      // User can not proceed with different passwords
      cy.findByText('Confirm Password').siblings('input').type('DifferentPassword');
      cy.findByRole('button', { name: 'Next' }).should('be.disabled');
      cy.get('.error-message').contains('Passwords do not match').should('be.visible');
    });

    it('Password checkmarks are displayed correctly', () => {
      fillOutRegistrationForm(validFieldData);

      // Validate that only user data policy is checked and all others are marked as X and using red text
      cy.findByText('Password').siblings('input').clear().type('O');
      cy.get('li.text-danger:contains("Must be at least 8 characters long")').contains('close').should('be.visible');
      cy.get('li:contains("Cannot match the value of First Name, Email, Last Name, Username")').contains('check').should('be.visible');
      cy.get('li.text-danger:contains("One lowercase character, one uppercase character, one number, one special character")').contains('close').should('be.visible');

      // Validate all policies are checked when password meets all requirements
      cy.findByText('Password').siblings('input').clear().type('Valid.1Pass');
      cy.get('li:contains("Must be at least 8 characters long")').contains('check').should('be.visible');
      cy.get('li:contains("Cannot match the value of First Name, Email, Last Name, Username")').contains('check').should('be.visible');
      cy.get('li:contains("One lowercase character, one uppercase character, one number, one special character")').contains('check').should('be.visible');

      // Validate that user data policy is unchecked and red when password contains user email, all others pass
      cy.findByText('Password').siblings('input').type(validFieldData[4].text);
      cy.get('li:contains("Must be at least 8 characters long")').contains('check').should('be.visible');
      cy.get('li.text-danger:contains("Cannot match the value of First Name, Email, Last Name, Username")').contains('close').should('be.visible');
      cy.get('li:contains("One lowercase character, one uppercase character, one number, one special character")').contains('check').should('be.visible');
    });
  });
});
