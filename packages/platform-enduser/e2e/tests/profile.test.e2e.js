/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests, retryableBeforeEach } from '../../../../e2e/util';
import { createIDMUser } from '../api/managedApi.e2e';

const path = require('path');

const userObject = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';

filterTests(['forgeops', 'cloud'], () => {
  describe('Enduser Profile View', () => {
    let userName;
    let userId;
    const locationUrl = Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/enduser/?realm=alpha#/profile` : `${Cypress.config().baseUrl}/enduser/?realm=root#/profile`;
    const downloadsFolder = Cypress.config('downloadsFolder');

    retryableBeforeEach(() => {
      // Get an admin access token and use it to create the test user
      cy.loginAsAdmin().then(() => {
        createIDMUser().then(({ body: { userName: responseUserName, _id: responseUserId } }) => {
          userName = responseUserName;
          userId = responseUserId;
          cy.logout();

          // Login to the endusers profile page
          cy.loginAsEnduser(userName);
          cy.visit(locationUrl);
        });
      });
    });

    it('should show basic data on the profile view, allow downloading user data, and allow account deletion', () => {
      // Check that the profile page is shown
      cy.get('[href="#/profile"]', { timeout: 30000 })
        .should('exist')
        .should('have.class', 'router-link-active');

      // Check that the avatar and name are shown
      cy.get('div.profileCol')
        .get('.b-avatar')
        .should('exist');
      cy.get('div.profileCol .card-body')
        .should('contain', 'First Last');

      // Check that the user can download their data
      cy.findByRole('tab', { name: 'Download your data' }).click();
      cy.findByRole('button', { name: 'Download' }).click();
      cy.readFile(path.join(downloadsFolder, 'userProfile.json')).should('exist');

      // Check that the user can delete their account
      cy.get('div.accordion').within(() => {
        cy.get('div.card-header').contains('Delete Account').click();
      });
      cy.get('button.btn-danger:last')
        .should('exist')
        .click();
      cy.get('h5.modal-title').should('contain', 'Permanently Delete Your Account?');

      // Watch for the user being deleted
      cy.intercept('DELETE', `**/openidm/managed/${userObject}/${userId}`).as('deleteUser');

      // Delete the user account
      cy.get('div.modal-body').should('contain', 'Are you sure you want to permanently delete your account data?');
      cy.get('footer.modal-footer').within(() => {
        cy.get('button.btn-danger')
          .should('be.enabled')
          .should('contain', 'Delete Account')
          .click();
      });

      // Check that the user was deleted successfully and the browser has been directed to the login page
      cy.wait('@deleteUser').its('response.statusCode').should('eq', 200);
      cy.contains('Sign In', { matchCase: false }).should('be.visible');
    });
  });
});
