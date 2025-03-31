/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { random } from 'lodash';
import { filterTests } from '../../../../e2e/util';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';

filterTests(['@forgeops', '@cloud', '@smoke'], () => {
  xdescribe('EndUser Login Journey', () => {
    const loginFailedErrorMessage = 'Login failure';
    const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';
    const defaultLoginUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=Login#/`;
    const userName = `testUser${random(Number.MAX_SAFE_INTEGER)}`;
    const defaultPassword = 'Rg_GRg9k&e';
    let userId;
    const incorrectPassword = 'incorrectPassword';
    const incorrectUserName = 'incorrectUsername';

    function loginEnduser(user, password) {
      cy.findByLabelText('User Name', { timeout: 20000 })
        .should('be.visible')
        .type(user, { force: true })
        .should('have.value', user);
      cy.findByLabelText('Password').first()
        .type(password, { force: true })
        .should('have.value', password);
      cy.findByRole('button', { name: 'Next' }).click();
    }

    before(() => {
      // Login as admin
      cy.login();

      // Create testing IDM enduser
      cy.log('Create new IDM Enduser').then(() => {
        createIDMUser({
          userName,
          password: defaultPassword,
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
      cy.visit(defaultLoginUrl);

      // Check the browser has been directed to the default Login page
      cy.findByLabelText('User Name').should('be.visible');
      cy.findByLabelText('Password').should('be.visible');
    });

    after(() => {
      // Login as admin, delete testing IDM enduser
      cy.login().then(() => {
        deleteIDMUser(userId);
      });
    });

    it('C20212 - Proceed with no credentials', () => {
      cy.findByLabelText('User Name').should('be.visible');
      cy.findByLabelText('Password').first();
      cy.findByRole('button', { name: 'Next' }).click();
      cy.location().should((location) => {
        expect(location.href).to.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=Login#/`);
      });
    });

    it('C20237 - Enduser - Valid enduser login flow', () => {
      loginEnduser(userName, defaultPassword);
      cy.findByRole('button', { name: 'Edit Your Profile', timeout: 20000 }).should('be.visible');
    });

    /** This scenario is locked by bug https://bugster.forgerock.org/jira/browse/IAM-1930 waiting for resolution */
    xit('C20211 - Login with wrong username and correct password', () => {
      loginEnduser(incorrectUserName, defaultPassword);
      cy.findByRole('alert').contains(loginFailedErrorMessage).should('be.visible');
    });

    /** This scenario is locked by bug https://bugster.forgerock.org/jira/browse/IAM-1930 waiting for resolution */
    xit('C20210 - Login with existing user and wrong password', () => {
      loginEnduser(userName, incorrectPassword);
      cy.findByRole('alert').contains(loginFailedErrorMessage).should('be.visible');
    });

    /** This scenario is locked by bug https://bugster.forgerock.org/jira/browse/IAM-6739 */
    xit('C20236 - Make 6 failed logins in a row - user is locked', () => {
      const maxAttempts = 6;
      for (let i = 0; i < maxAttempts; i += 1) {
        loginEnduser(userName, incorrectPassword);
      }
      // Last login attempt
      loginEnduser(userName, incorrectPassword);
      // user locked out verification
      cy.findAllByRole('alert').contains('Login failure');
      // cy.findByRole('alert').contains('User Locked Out'); // This is the expected message, but it is not displayed is locked by bug https://bugster.forgerock.org/jira/browse/IAM-6739
    });
  });
});
