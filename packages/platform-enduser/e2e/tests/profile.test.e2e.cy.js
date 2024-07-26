/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random, find } from 'lodash';
import { filterTests, retryableBeforeEach } from '../../../../e2e/util';
import { createIDMUser } from '../api/managedApi.e2e';
import {
  createNewTheme,
  setThemeAsDefault,
  deleteTheme,
  saveThemeEdit,
} from '../pages/common/hostedPages';
import { getThemesList } from '../api/themeApi.e2e';

const path = require('path');

filterTests(['forgeops', 'cloud'], () => {
  describe('Enduser Profile View', () => {
    const userObject = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    const downloadsFolder = Cypress.config('downloadsFolder');
    const loginRealm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';
    const hostedPagesUrl = `${Cypress.config().baseUrl}/platform/?realm=${loginRealm}#/hosted-pages`;
    let userName = '';
    let userId;
    let testThemeName = '';
    let defaultTheme = '';

    retryableBeforeEach(() => {
      // Generate unique test Theme name
      testThemeName = `test_theme_${random(Number.MAX_SAFE_INTEGER)}`;

      cy.loginAsAdmin().then(() => {
        getThemesList().then((list) => {
          // Gets the Default Theme from the list of themes so it can be set back as the Realm default at the end of the test
          defaultTheme = find(list.body.realm[loginRealm], { isDefault: true }).name;
        });
      });

      // Create testing IDM enduser
      cy.log('Create new IDM Enduser').then(() => {
        createIDMUser().then(({ body: { userName: responseUserName, _id: responseUserId } }) => {
          userName = responseUserName;
          userId = responseUserId;
        });
      });

      cy.log('Create new testing Theme with "Account Controls" option enabled').then(() => {
        cy.visit(hostedPagesUrl);
        createNewTheme(testThemeName);
        // Setup "Account Controls" option for the test Theme
        cy.findByRole('tab', { name: 'Account Pages' }).click();
        cy.findByRole('tab', { name: 'Layout' }).click();
        cy.findByRole('checkbox', { name: 'Account Controls' }).scrollIntoView().should('not.be.checked').click({ force: true });

        // Save the Theme and set it as the Realm Default
        saveThemeEdit();
        setThemeAsDefault(testThemeName);

        cy.logout();
      });
    });

    afterEach(() => {
      // Clear cookies
      cy.logout();

      // Login as admin, set the Default Theme back as the Realm default and delete the test Theme
      cy.loginAsAdmin().then(() => {
        cy.visit(hostedPagesUrl);
        // Wait for the Themes table to load
        cy.findByRole('heading', { level: 1, name: 'Hosted Pages' }).should('be.visible');
        cy.findByRole('button', { name: 'New Theme', timeout: 10000 }).should('be.visible');

        setThemeAsDefault(defaultTheme);
        deleteTheme(testThemeName);
      });
    });

    it('should show basic data on the profile view, allow downloading user data, and allow account deletion', () => {
      // Log in to the enduser UI and check that the Theme changes have been correctly applied
      cy.loginAsEnduser(userName);

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
