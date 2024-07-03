/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests, retryableBeforeEach } from '../../../../e2e/util';
import { createIDMUser } from '../api/managedApi.e2e';

const path = require('path');

filterTests(['forgeops', 'cloud'], () => {
  const userObject = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';

  describe('Enduser Profile View', () => {
    let userName;
    let userId;
    const downloadsFolder = Cypress.config('downloadsFolder');

    retryableBeforeEach(() => {
      // Get an admin access token and use it to create the test user
      cy.loginAsAdmin().then(() => {
        createIDMUser().then(({ body: { userName: responseUserName, _id: responseUserId } }) => {
          userName = responseUserName;
          userId = responseUserId;
          cy.logout();

          // Login as Enduser
          cy.loginAsEnduser(userName);
        });
      });
    });

    it('should show basic data on the profile view, allow downloading user data, and allow account deletion', () => {
      // Redirect to Enduser profile page
      cy.get('[href="#/profile"]').should('be.visible').click();

      // Check link in the side menu is active
      cy.get('[href="#/profile"]').should('exist').should('have.class', 'router-link-active');

      // Check that the profile page is shown
      const profileHref = Cypress.env('IS_FRAAS') ? '/enduser/?realm=/alpha#/profile' : '/enduser/#/profile';
      cy.location('href').should('contain', profileHref);

      // Check that the avatar and name are shown
      cy.get('div.profileCol').get('.b-avatar').should('be.visible');
      cy.get('div.profileCol .card-body').should('be.visible').should('contain', 'First Last');

      // Check that the user can download their data
      cy.findByRole('tab', { name: 'Download your data' }).should('be.visible').click();
      cy.findByRole('button', { name: 'Download' }).should('be.visible').click();
      cy.readFile(path.join(downloadsFolder, 'userProfile.json')).should('exist');

      // Check that the user can delete their account
      cy.findByRole('tab', { name: 'Delete Account' }).should('be.visible').click();
      cy.findByRole('button', { name: 'Delete Account' }).should('be.visible').click();

      // Watch for the user being deleted
      cy.intercept('DELETE', `**/openidm/managed/${userObject}/${userId}`).as('deleteUser');

      // Check that the danger modal is coorecly shown
      cy.get('.modal-title').should('be.visible').should('contain', 'Permanently Delete Your Account?');
      cy.get('.modal-body').should('be.visible').should('contain', 'Are you sure you want to permanently delete your account data?');
      cy.get('.modal-footer').within(() => {
        // Delete the user account
        cy.get('button.btn-danger').should('be.enabled').should('contain', 'Delete Account').click();
      });

      // Check that the user was deleted successfully
      cy.wait('@deleteUser').its('response.statusCode').should('eq', 200);

      // Check the browser has been directed to the login page
      const loginHeading = Cypress.env('IS_FRAAS') ? 'Sign In' : 'Sign in';
      cy.findByRole('heading', { name: loginHeading, level: 1, timeout: 10000 }).should('exist').should('be.visible');
    });
  });
});
