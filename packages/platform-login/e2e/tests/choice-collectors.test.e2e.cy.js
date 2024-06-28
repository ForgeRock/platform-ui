/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { filterTests } from '../../../../e2e/util';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';

filterTests(['forgeops', 'cloud'], () => {
  describe('Choice collector tests', () => {
    const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';
    const journey = `QA-Choice_Collectors_${Cypress.env('IS_FRAAS') ? 'Cloud' : 'ForgeOps'}.json`;
    const locationUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=QA%20-%20Choice%20Collectors#/`;
    const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
    const userPassword = 'Pass1234!';
    let userId;

    before(() => {
      // Login as admin and import correct testing Journey
      cy.importTreesViaAPI([journey]);

      // Create testing IDM enduser
      cy.log('Create new IDM Enduser').then(() => {
        createIDMUser({
          userName,
          password: userPassword,
          givenName: userName,
          sn: 'test',
        }).then((result) => {
          expect(result.status).to.equal(201);
          userId = result.body._id;

          cy.logout();
        });
      });
    });

    beforeEach(() => {
      // Load base Journey URL
      cy.visit(locationUrl);

      // Check correct Journey has loaded
      cy.findByRole('heading', { name: 'Choices UI Journey', level: 1 }).should('be.visible');
    });

    after(() => {
      // Login as admin, delete imported testing Journey & delete testing IDM enduser
      cy.deleteTreesViaAPI([journey]).then(() => {
        deleteIDMUser(userId);
      });
    });

    function loginEnduser() {
      // Fill in credetials
      cy.findByLabelText('User Name', { timeout: 20000 }).type(userName);
      cy.findByLabelText('Password').type(userPassword);
      // Proceed to the next step
      cy.findByRole('button', { name: 'Next' }).click();
      // Make sure we are on a correct Page Node
      cy.findByRole('heading', { name: 'Radio Choice Collector!', level: 1 }).should('be.visible');
    }

    function chooseRadioOption(option) {
      // Choose 'option'
      cy.findByRole('radio', { name: option }).should('not.be.checked').check({ force: true });
      // Proceed with the Choice
      cy.findByRole('button', { name: 'Next' }).click();
    }

    it('Page Node with Radio Choice Collector - default value is checked and working', () => {
      // Login as Enduser
      loginEnduser();

      // Check that the default option is checked
      cy.findByRole('radio', { name: 'Go back :/' }).should('be.checked');
      // Proceed with the Choice
      cy.findByRole('button', { name: 'Next' }).click();

      // Journey returns back to Default page
      cy.findByRole('heading', { name: 'Choices UI Journey', level: 1 }).should('be.visible');
      // And check that no error is shown
      cy.findByTestId('FrAlert').should('not.exist');
    });

    it('Page Node with Radio Choice Collector - Unconnected node returns to the start of a Journey', () => {
      const nodeToLoad = 'Unconnected node';

      // Login as Enduser
      loginEnduser();

      // Choose radio button where Journey should proceed
      chooseRadioOption(nodeToLoad);

      // Journey returns back to Default page
      cy.findByRole('heading', { name: 'Choices UI Journey', level: 1 }).should('be.visible');
      // And correct error is shown
      cy.findByTestId('FrAlert').should('exist').contains("Sorry that isn't right. Try again.");
    });

    it('Page Node with Message Node - Positive answer works correctly', () => {
      const nodeToLoad = 'Buttons test!';

      // Login as Enduser
      loginEnduser();

      // Choose radio button where Journey should proceed
      chooseRadioOption(nodeToLoad);

      // Proceed to the next Journey page
      cy.findByRole('heading', { name: nodeToLoad, level: 1 }).should('be.visible');

      // Proceed to the next step
      cy.findByRole('button', { name: 'Yes!' }).click();

      // Wait for successfull login
      cy.findByTestId('dashboard-welcome-greeting', { timeout: 20000 });
    });

    it('Page Node with Message Node - Negative answer works correctly', () => {
      const nodeToLoad = 'Buttons test!';

      // Login as Enduser
      loginEnduser();

      // Choose radio button where Journey should proceed
      chooseRadioOption(nodeToLoad);

      // Proceed to the next Journey page
      cy.findByRole('heading', { name: nodeToLoad, level: 1 }).should('be.visible');

      // Proceed to the next step
      cy.findByRole('button', { name: 'No!' }).click();

      // Journey returns back to Choice Collector page
      cy.findByRole('heading', { name: 'Radio Choice Collector!', level: 1 }).should('be.visible');
      // And default option is checked again
      cy.findByRole('radio', { name: 'Go back :/' }).should('be.checked');
    });

    it('Message Node - Positive answer works correctly', () => {
      const nodeToLoad = 'Message node!';

      // Login as Enduser
      loginEnduser();

      // Choose radio button where Journey should proceed
      chooseRadioOption(nodeToLoad);

      // Proceed to the next Journey page
      cy.get('#wrapper > div.row > div').should('be.visible').contains(nodeToLoad);

      // Proceed to the next step
      cy.findByRole('button', { name: 'OK!' }).click();

      // Wait for successfull login
      cy.findByTestId('dashboard-welcome-greeting', { timeout: 20000 });
    });

    it('Message Node - Negative answer works correctly', () => {
      const nodeToLoad = 'Message node!';

      // Login as Enduser
      loginEnduser();

      // Choose radio button where Journey should proceed
      chooseRadioOption(nodeToLoad);

      // Proceed to the next Journey page
      cy.get('#wrapper > div.row > div').should('be.visible').contains(nodeToLoad);

      // Proceed to the next step
      cy.findByRole('button', { name: 'NOT OK!' }).click();

      // Journey returns back to Choice Collector page
      cy.findByRole('heading', { name: 'Radio Choice Collector!', level: 1 }).should('be.visible');
      // And default option is checked again
      cy.findByRole('radio', { name: 'Go back :/' }).should('be.checked');
    });

    it('Page Node with Select Choice Collector - Happy path works correctly', () => {
      const nodeToLoad = 'Select Choice Collector!';

      // Login as Enduser
      loginEnduser();

      // Choose radio button where Journey should proceed
      chooseRadioOption(nodeToLoad);

      // Proceed to the next Journey page
      cy.findByRole('heading', { name: nodeToLoad, level: 1 }).should('be.visible');
      cy.findAllByRole('combobox').contains('Return back :/');

      // Pick Happy path
      cy.findAllByRole('combobox').type('Proceed!{enter}');

      // Proceed to the next step
      cy.findByRole('button', { name: 'Next' }).click();

      // Wait for successfull login
      cy.findByTestId('dashboard-welcome-greeting', { timeout: 20000 });
    });

    it('Page Node with Select Choice Collector - Unhappy path works correctly', () => {
      const nodeToLoad = 'Select Choice Collector!';

      // Login as Enduser
      loginEnduser();

      // Choose radio button where Journey should proceed
      chooseRadioOption(nodeToLoad);

      // Proceed to the next Journey page
      cy.findByRole('heading', { name: nodeToLoad, level: 1 }).should('be.visible');
      cy.findAllByRole('combobox').contains('Return back :/');

      // Proceed to the next step
      cy.findByRole('button', { name: 'Next' }).click();

      // Journey returns back to Choice Collector page
      cy.findByRole('heading', { name: 'Radio Choice Collector!', level: 1 }).should('be.visible');
      // And default option is checked again
      cy.findByRole('radio', { name: 'Go back :/' }).should('be.checked');
    });
  });
});
