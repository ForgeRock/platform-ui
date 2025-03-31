/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { filterTests } from '../../../../e2e/util';
import { createIDMUser, deleteIDMUser } from '../../../platform-admin/e2e/api/managedApi.e2e';

filterTests(['@forgeops', '@cloud'], () => {
  describe('End-user update password flow', () => {
    const realmUser = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    const userInfoRealm = Cypress.env('IS_FRAAS') ? '/realms/root/realms/alpha' : '';
    const authenticateRealm = Cypress.env('IS_FRAAS') ? '/realms/alpha' : '';
    const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';
    const defaultLoginUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=Login#/`;
    const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
    const defaultPassword = 'Rg_GRg9k&e';
    const updatedUserPassword = defaultPassword.split('').reverse().join('');
    let userId;

    before(() => {
      // Login as admin & create testing IDM enduser
      cy.loginAsAdmin().then(() => {
        createIDMUser({
          userName,
          password: defaultPassword,
        }).then((result) => {
          expect(result.status).to.equal(201);
          userId = result.body._id;

          cy.logout();
        });
      });
    });

    after(() => {
      // Login as admin & delete testing IDM enduser
      cy.loginAsAdmin().then(() => {
        deleteIDMUser(userId);
      });
    });

    it('Logs in with new user, switch to profile view, updates password and checks it was updated successfully', () => {
      // Login as Enduser with password used during creation
      cy.loginAsEnduser(userName, defaultPassword);

      // Set up intercepts
      cy.intercept('GET', '/openidm/config/ui/themerealm').as('themerealmConfig');
      cy.intercept('GET', `/openidm/managed/${realmUser}/${userId}`).as('getNewUser');
      cy.intercept('GET', `/am/json${userInfoRealm}/users/${userId}`).as('getUserInfo');
      cy.intercept('POST', `/am/json/realms/root${authenticateRealm}/authenticate`).as('authenticate');

      // Open profile settings
      cy.findByRole('link', { name: 'Profile' }).should('be.visible').click();

      // Wait for profile page to load
      cy.wait('@getNewUser', { timeout: 10000 });
      cy.findByRole('heading', { name: 'Sign-in & Security', timeout: 5000 }).should('be.visible');

      // Find and click link to Reset Password
      cy.findByRole('link', { name: 'Reset Password' }).should('be.visible').click();

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });

      // Check the browser has been directed to the Verify Existing Password page
      cy.findByRole('button', { name: 'Next', timeout: 5000 }).should('be.visible').should('be.enabled');
      cy.findByRole('heading', { name: 'Verify Existing Password' }).should('be.visible');

      // Filling in empty password should result in an error
      cy.findByLabelText('Password').should('be.visible').should('have.value', '');
      cy.findByRole('button', { name: 'Next' }).click();

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });
      cy.findByTestId('FrAlert').should('be.visible').contains('Login failure');

      // Filling in wrong password should result in an error
      cy.findByLabelText('Password')
        .should('be.visible')
        .should('have.value', '')
        .type(updatedUserPassword, { force: true })
        .should('have.value', updatedUserPassword);
      cy.findByRole('button', { name: 'Next' }).click();

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });
      cy.findByTestId('FrAlert').should('be.visible').contains('Login failure');

      // Fill in correct password and proceed to the next step
      cy.findByLabelText('Password')
        .should('be.visible')
        .should('have.value', '')
        .type(defaultPassword, { force: true })
        .should('have.value', defaultPassword);
      cy.findByRole('button', { name: 'Next' }).click();

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });
      cy.wait('@authenticate', { timeout: 5000 });
      cy.wait('@authenticate', { timeout: 5000 });

      cy.findByRole('heading', { name: 'Update Password' }).should('be.visible');
      cy.findByRole('button', { name: 'Next' }).should('be.visible').should('be.disabled');

      // Make sure password requirements are fully loaded (Journey won't work without password requirements being shown and they might load after Next button is visible)
      cy.findByText('Must be at least 8 characters long').should('be.visible');
      if (!Cypress.env('IS_FRAAS')) {
        cy.findByText('Must have at least 1 capital letter(s)').should('be.visible');
        cy.findByText('Must have at least 1 number(s)').should('be.visible');
      } else {
        cy.findByText('One lowercase character, one uppercase character, one number, one special character').should('be.visible');
      }

      // Type in new password
      cy.findByLabelText('Password')
        .should('be.visible')
        .should('have.value', '')
        .type(updatedUserPassword, { force: true })
        .should('have.value', updatedUserPassword);
      cy.findByRole('button', { name: 'Next' }).should('be.enabled').click();

      // Wait for password to be changed
      cy.wait('@getUserInfo', { timeout: 10000 });
      // Wait for profile page to load
      cy.wait('@getNewUser', { timeout: 10000 });
      cy.findByRole('heading', { name: 'Sign-in & Security', timeout: 5000 }).should('be.visible');

      // Logout user
      cy.logout();

      // Load base Login Journey URL
      cy.visit(defaultLoginUrl);

      // Try to login with old password that should no longer work
      cy.loginAsEnduser(userName, defaultPassword, false);

      // Wait for a Journey page to fully load
      cy.wait('@themerealmConfig', { timeout: 10000 });
      if (!Cypress.env('IS_FRAAS')) {
        cy.findByTestId('FrAlert').should('exist').contains('Login failure').should('be.visible');
      }

      // Try to login with new password that should be correctly set
      cy.loginAsEnduser(userName, updatedUserPassword);

      // Clear cookies
      cy.logout();
    });
  });
});
