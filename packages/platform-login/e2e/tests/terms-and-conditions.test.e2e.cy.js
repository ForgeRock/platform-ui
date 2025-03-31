/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import setTerms from '../api/consentApi.e2e';

filterTests(['@forgeops', '@cloud'], () => {
  describe('Login tests for Terms and Conditions', () => {
    // T&C params
    const termsName = 'QA - Accept Terms and Conditions';
    const termsContent = 'If you see this text, then the Terms and Conditions are working correctly and showing the currently active version!';
    const termsBody = {
      active: termsName,
      versions: [
        {
          version: '0.0',
          termsTranslations: {
            en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          },
          createDate: '2019-10-28T04:20:11.320Z',
        },
        {
          version: termsName,
          termsTranslations: {
            en: termsContent,
          },
          createDate: '2024-06-27T17:00:13.205Z',
        },
      ],
    };

    // Journey params
    const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';
    const locationUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=QA%20-%20Accept%20Terms%20and%20Conditions#/`;
    const journey = `QA-Accept_Terms_and_Conditions_${Cypress.env('IS_FRAAS') ? 'Cloud' : 'ForgeOps'}.json`;
    const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
    const userPassword = 'Rg_GRg9k&e';
    let userId;

    function loadJourney() {
      // Load base Journey URL
      cy.visit(locationUrl);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Check correct Journey has loaded
      cy.findByRole('heading', { name: 'Terms & Conditions UI Journey', level: 1 }).should('be.visible');
    }

    function loginEnduser() {
      // Fill in credetials
      cy.findByLabelText('User Name', { timeout: 20000 }).type(userName, { force: true });
      cy.findByLabelText('Password').type(userPassword, { force: true });
      // Proceed to the next step
      cy.findByRole('button', { name: 'Next' }).click();
    }

    before(() => {
      // Login as admin and import correct testing Journey
      cy.importTreesViaAPI([journey]);

      // Create testing IDM enduser
      cy.log('Create new Enduser without accepted T&C').then(() => {
        createIDMUser({
          userName,
          password: userPassword,
          givenName: userName,
          sn: 'test',
        }).then((result) => {
          expect(result.status).to.equal(201);
          userId = result.body._id;
        });
      });

      // Add a testing T&C to check it overrides default T&C
      cy.log('Set testing T&C').then(() => {
        setTerms(termsBody);
      });

      cy.logout();
    });

    retryableBeforeEach(() => {
      // Set up intercept
      cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');

      // Redirect to the start of T&C Journey
      loadJourney();
    });

    after(() => {
      // Login as admin, delete imported testing Journey & delete testing IDM enduser
      cy.deleteTreesViaAPI([journey]).then(() => {
        deleteIDMUser(userId);
        setTerms();
      });
    });

    it('Created user should be prompted to accept T&C if not yet accepted', () => {
      // Login as Enduser
      loginEnduser();

      // Check that T&C are prompted
      cy.get('small').should('be.visible').contains("By clicking 'Next' you agree to our Terms & Conditions");

      // Reload page to check that T&C are not automatically accepted when prompted
      cy.reload();

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Again Login as Enduser
      loginEnduser();

      // Check that T&C are still prompted
      cy.get('small').should('be.visible').contains("By clicking 'Next' you agree to our Terms & Conditions");

      // Click on the Terms & Conditions link
      cy.findByRole('link', { name: 'Terms & Conditions' }).click();

      // Check that T&C are correctly shown as a dialog
      cy.findByRole('dialog').within(() => {
        // Check T&C header is shown
        cy.findByRole('heading', { name: 'Terms & Conditions', level: 5 }).should('be.visible');

        // Check T&C content is correct
        cy.findByText(termsContent).should('be.visible');
      });
    });

    it('Created user should not be prompted to accept T&C when already accepted', () => {
      // Login as Enduser
      loginEnduser();

      // Check that T&C are prompted
      cy.get('small').should('be.visible').contains("By clicking 'Next' you agree to our Terms & Conditions");

      // Accept T&C
      cy.findByRole('button', { name: 'Next' }).click();

      // Wait for successfull login
      cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${userName}`).should('be.visible');

      // Logout to proceed with the next step
      cy.logout();

      // Redirect to the start of T&C Journey
      loadJourney();

      // Again Login as Enduser
      loginEnduser();

      // Wait for successfull login (user should not be prompted to accept T&C again)
      cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${userName}`).should('be.visible');
    });
  });
});
