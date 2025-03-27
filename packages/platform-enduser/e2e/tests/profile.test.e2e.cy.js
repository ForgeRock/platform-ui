/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';
import { createIDMUser } from '../api/managedApi.e2e';
import {
  navigateToHostedPagesViaSidebar,
  createNewTheme,
  setThemeAsDefault,
  saveThemeEdit,
  searchForThemes,
  deleteAllThemesFromList,
} from '../pages/common/hostedPages';

const path = require('path');

filterTests(['@forgeops', '@cloud'], () => {
  describe('Enduser Profile View', () => {
    const userObject = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    const downloadsFolder = Cypress.config('downloadsFolder');
    const defaultTheme = Cypress.env('IS_FRAAS') ? 'Starter Theme' : 'ForgeRock Theme';
    let userName = '';
    let userId;
    let testThemeName = '';

    retryableBeforeEach(() => {
      // Generate unique test Theme name
      testThemeName = `test_theme_${random(Number.MAX_SAFE_INTEGER)}`;

      // Login as admin and create testing IDM user
      cy.loginAsAdmin().then(() => {
        createIDMUser().then(({ body: { userName: responseUserName, _id: responseUserId } }) => {
          userName = responseUserName;
          userId = responseUserId;
        });

        // Navigate to the Hosted Pages page
        navigateToHostedPagesViaSidebar();

        // Create a new testing Theme
        createNewTheme(testThemeName);

        // Setup "Account Controls" option for the test Theme
        cy.findByRole('tab', { name: 'Account Pages' }).should('be.visible').click();
        cy.findByRole('tab', { name: 'Layout' }).should('be.visible').click();
        cy.findByRole('checkbox', { name: 'Account Controls' })
          .should('exist')
          .scrollIntoView()
          .should('not.be.checked')
          .click({ force: true })
          .should('be.checked');

        // Save the Theme
        saveThemeEdit();

        // Set the test Theme as the default
        setThemeAsDefault(testThemeName);

        cy.logout();
      });
    });

    after(() => {
      // Clear cookies
      cy.logout();

      // Login as admin
      cy.loginAsAdmin().then(() => {
        // Navigate to the Hosted Pages page
        navigateToHostedPagesViaSidebar();

        // Set the Realm Default Theme back to the default
        setThemeAsDefault(defaultTheme);

        // Search for our Theme in the list
        searchForThemes('test_theme');

        // Delete all of the testing Themes
        deleteAllThemesFromList();
      });
    });

    it('Should show basic data on the profile view, allow downloading user data, and allow account deletion', () => {
      // Log in to the enduser UI and check that the Theme changes have been correctly applied
      cy.loginAsEnduser(userName);

      // Redirect to Enduser profile page
      cy.findByRole('link', { name: 'Profile' }).should('be.visible').click();

      // Check link in the side menu is active
      cy.findByRole('link', { name: 'Profile' }).should('have.class', 'router-link-active');

      // Check that the profile page is shown
      cy.location('href').should('contain', '#/profile');

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
      cy.findByRole('heading', { name: 'Sign In', timeout: 10000 }).should('be.visible');
    });
  });
});
