/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { createIDMUser, deleteIDMUser } from '@e2e/api/managedApi.e2e';
import { retryableBeforeEach } from '@e2e/util';

const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';

function waitForJourneyPageLoad() {
  // Journey page is fully loaded when the User Name field is rendered and visible.
  // Focus is no longer placed on the input itself by default — handleFocus targets
  // the page container/main element after themeLoading completes.
  cy.findByLabelText('User Name', { timeout: 10000 }).should('be.visible');
}

function proceedToNextJourneyPage() {
  cy.findByRole('button', { name: 'Next' }).click();
}

describe('Check Remember Me theme feature functionality', { tags: ['@forgeops', '@cloud'] }, () => {
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

  // Login as admin, delete prepared Journey with Remember Me Themes & delete testing IDM enduser
  after(() => cy.deleteTreesViaAPI(['Remember_me_journey.json']).then(() => {
    deleteIDMUser(userId);
  }));

  it('[TC-12163] Username is correctly remembered when Remember Me option is checked', () => {
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

  it('[TC-12164] Username is not remembered when Remember Me option is not checked', () => {
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

  it('[TC-12165] Username is remembered after page reload when Remember Me option is checked', () => {
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

  it('[TC-12167] Username is remembered after failed login when Remember Me option is checked', () => {
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

  it('[TC-12168] Username is remembered after logout when Remember Me option is checked', () => {
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

    // Wait for successfull login — URL change is the most reliable signal
    cy.location('pathname', { timeout: 20000 }).should('eq', '/enduser/');

    // And logout enduser
    // Toggle settings dropdown
    cy.get('button.dropdown-toggle', { timeout: 20000 }).should('be.visible').click({ force: true });
    // Find and click Sign out button within the dropdown menu
    cy.findByRole('menuitem', { name: /Sign out/i }).click();

    // Wait for the sign-out redirect to complete before re-visiting the journey.
    // Without this, cy.visit can race the AM session teardown and land back on /enduser/.
    cy.url({ timeout: 20000 }).should('not.include', '/enduser');

    // After Sign out the browser lands on the default Sign In page, which does not have
    // journeyRememberMeEnabled. Re-visit the Remember Me journey so the theme loads and
    // the remembered username/checkbox state is rehydrated by setRememberedUsername().
    cy.visit(locationUrl);
    waitForJourneyPageLoad();
    cy.findByRole('radio', { name: 'Login - Remember Me' }).click({ force: true });
    proceedToNextJourneyPage();
    waitForJourneyPageLoad();

    // Check that Username is still correctly remembered.
    // Wait for the value to be non-empty first — setRememberedUsername() runs in a $nextTick
    // callback so the input can be visible before its value is rehydrated.
    cy.findByLabelText('User Name', { timeout: 10000 }).should('be.visible').and('not.have.value', '').and('have.value', userName);

    // And finally check that Remember Me is still enabled
    cy.findByRole('checkbox', { name: 'Remember Me' }).should('be.checked');
  });
});
