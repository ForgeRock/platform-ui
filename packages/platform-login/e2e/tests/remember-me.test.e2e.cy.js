/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';

const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';

function waitForJourneyPageLoad() {
  // Journey page is fully loaded when User name fields gets automatically focused
  cy.findByLabelText('User Name', { timeout: 10000 }).should('be.focused');
}

function proceedToNextJourneyPage() {
  cy.findByRole('button', { name: 'Next' }).click();
}

filterTests(['@forgeops', '@cloud'], () => {
  xdescribe('Check Remember Me theme feature functionality', () => {
    const locationUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=Remember%20Me#/`;
    const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
    const userPassword = 'Rg_GRg9k&e';
    let userId;

    before(() => {
      // Login as admin, import prepared Journey with Remember Me Themes & create testing IDM enduser
      cy.importTreesViaAPI(['Remember_me_journey.json']).then(() => {
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
      cy.logout();
    });

    retryableBeforeEach(() => {
      // Visit base page of our prepared Journey
      cy.visit(locationUrl);
      // Wait for a page to load
      waitForJourneyPageLoad();
    });

    after(() => {
      // Login as admin, delete prepared Journey with Remember Me Themes & delete testing IDM enduser
      cy.deleteTreesViaAPI(['Remember_me_journey.json']).then(() => {
        deleteIDMUser(userId);
      });
    });

    it('Username is correctly remembered when Remember Me option is checked', () => {
      // Fill in Username to be remembered
      cy.findByLabelText('User Name').type(userName);

      // Check the Remember Me checkbox
      // By default Remember Me should be disabled
      cy.findByRole('checkbox', { name: 'Remember my username but with a really longer text here!' }).should('not.be.checked').click({ force: true });

      // Proceed to the next page
      proceedToNextJourneyPage();

      // Wait for a page to load
      waitForJourneyPageLoad();

      // Check that Username is correctly remembered on the next page node
      cy.findByLabelText('User Name').should('be.visible').should('have.value', userName);

      // And check that Remember Me is still be enabled
      cy.findByRole('checkbox', { name: 'S*m€ sp€ci@l ch@r@ct€r$ h€r€' }).should('exist').should('be.checked');

      // Proceed to the next page
      proceedToNextJourneyPage();

      // Wait for a page to load
      waitForJourneyPageLoad();

      // Check that Username is still correctly remembered
      cy.findByLabelText('User Name').should('be.visible').should('have.value', userName);

      // And finally check that Remember Me is still enabled
      cy.findByRole('checkbox', { name: 'Remember my username but with a really longer text here!' }).should('be.checked');
    });

    it('Username is not remembered when Remember Me option is not checked', () => {
      // Fill in Username to be remembered
      cy.findByLabelText('User Name').type(userName);

      // Check the Remember Me checkbox
      cy.findByRole('checkbox', { name: 'Remember my username but with a really longer text here!' }).should('not.be.checked').click({ force: true });

      // Proceed to the next page
      proceedToNextJourneyPage();

      // Wait for a page to load
      waitForJourneyPageLoad();

      // Check that Username is correctly remembered on the next page node
      cy.findByLabelText('User Name').should('be.visible').should('have.value', userName);

      // And check that Remember Me is still enabled & disable it
      cy.findByRole('checkbox', { name: 'S*m€ sp€ci@l ch@r@ct€r$ h€r€' }).should('exist').should('be.checked').click({ force: true });

      // Proceed to the next page
      proceedToNextJourneyPage();

      // Wait for a page to load
      waitForJourneyPageLoad();

      // Check that Username is not remembered
      cy.findByLabelText('User Name').should('be.visible').should('have.value', '');

      // And finally check that Remember Me is not enabled
      cy.findByRole('checkbox', { name: 'Remember my username but with a really longer text here!' }).should('not.be.checked');
    });

    it('Username is remembered after page reload when Remember Me option is checked', () => {
      // Fill in Username to be remembered
      cy.findByLabelText('User Name').type(userName);

      // Check the Remember Me checkbox
      cy.findByRole('checkbox', { name: 'Remember my username but with a really longer text here!' }).should('not.be.checked').click({ force: true });

      // Proceed to the next page
      proceedToNextJourneyPage();

      // Wait for a page to load
      waitForJourneyPageLoad();

      // Check that Username is correctly remembered on the next page node
      cy.findByLabelText('User Name').should('be.visible').should('have.value', userName);

      // And check that Remember Me is still enabled
      cy.findByRole('checkbox', { name: 'S*m€ sp€ci@l ch@r@ct€r$ h€r€' }).should('exist').should('be.checked');

      // Reload current page
      cy.reload();

      // Wait for a page to load
      waitForJourneyPageLoad();

      // Check that Username is still correctly remembered
      cy.findByLabelText('User Name').should('be.visible').should('have.value', userName);

      // And finally check that Remember Me is still enabled
      cy.findByRole('checkbox', { name: 'Remember my username but with a really longer text here!' }).should('be.checked');
    });

    // // TODO: Re-enable this test when https://bugster.forgerock.org/jira/browse/IAM-5915 gets fixed
    xit('Username is not remembered when switching to a theme with Remember Me option disabled', () => {
      // Fill in Username to be remembered
      cy.findByLabelText('User Name').type(userName);

      // Switch to the other testing page node without Remember Me feature enabled
      cy.findByRole('radio', { name: 'Username - Empty' }).click({ force: true });

      // Check the Remember Me checkbox
      cy.findByRole('checkbox', { name: 'Remember my username but with a really longer text here!' }).should('not.be.checked').click({ force: true });

      // Proceed to the next page
      proceedToNextJourneyPage();

      // Wait for a page to load
      waitForJourneyPageLoad();

      // Check that Username is correctly remembered on the next page node
      cy.findByLabelText('User Name').should('be.visible').should('have.value', userName);

      // Proceed to the next page
      proceedToNextJourneyPage();

      // Wait for a page to load
      waitForJourneyPageLoad();

      // Check that Username is not remembered
      cy.findByLabelText('User Name').should('be.visible').should('have.value', '');

      // And finally check that Remember Me is not enabled
      cy.findByRole('checkbox', { name: 'Remember my username but with a really longer text here!' }).should('not.be.checked');
    });

    it('Username is remembered after failed login when Remember Me option is checked', () => {
      // Switch to the other testing page node with Remember Me feature enabled and working Login page
      cy.findByRole('radio', { name: 'Login - Remember Me' }).click({ force: true });

      // Proceed to the next page
      proceedToNextJourneyPage();

      // Wait for a page to load
      waitForJourneyPageLoad();

      // Fill in Username to be remembered
      cy.findByLabelText('User Name').type(userName);

      // Fill in wrong password
      cy.findByLabelText('Password').type('baspassword');

      // Check Remember Me checkbox
      cy.findByRole('checkbox', { name: 'Remember Me', timeout: 10000 }).should('exist').should('not.be.checked').click({ force: true });

      // Try to login as enduser
      proceedToNextJourneyPage();

      // Wait for login to fail
      waitForJourneyPageLoad();

      // Check that Username is still correctly remembered
      cy.findByLabelText('User Name').should('be.visible').should('have.value', userName);

      // And finally check that Remember Me is still enabled
      cy.findByRole('checkbox', { name: 'Remember Me' }).should('be.checked');

      // And check that a password is not remembered
      cy.findByLabelText('Password').should('be.visible').should('have.value', '');
    });

    it('Username is remembered after logout when Remember Me option is checked', () => {
      // Switch to the other testing page node with Remember Me feature enabled and working Login page
      cy.findByRole('radio', { name: 'Login - Remember Me' }).click({ force: true });

      // Proceed to the next page
      proceedToNextJourneyPage();

      // Wait for a page to load
      waitForJourneyPageLoad();

      // Fill in Username to be remembered
      cy.findByLabelText('User Name').type(userName);

      // Fill in wrong password
      cy.findByLabelText('Password').type(userPassword);

      // Check Remember Me checkbox
      cy.findByRole('checkbox', { name: 'Remember Me', timeout: 10000 }).should('exist').should('not.be.checked').click({ force: true });

      // Login as enduser
      proceedToNextJourneyPage();

      // Wait for successfull login
      cy.findByRole('heading', { timeout: 20000 }).contains(`Hello, ${userName}`).should('be.visible');

      // And logout enduser
      // Toggle settings dropdown
      cy.get('button.dropdown-toggle').click({ force: true });
      // Find and click Sign out button within settings dropdown
      cy.get('.dropdown-menu.show').should('exist').within(() => {
        cy.get('.dropdown-item').contains('Sign out').click();
      });

      // Check that Username is still correctly remembered
      const userNameText = Cypress.env('IS_FRAAS') ? 'User Name' : 'User Name:';
      cy.findByLabelText(userNameText).should('be.visible').should('have.value', userName);

      // And finally check that Remember Me is still enabled
      cy.findByRole('checkbox', { name: 'Remember Me' }).should('be.checked');
    });
  });
});
