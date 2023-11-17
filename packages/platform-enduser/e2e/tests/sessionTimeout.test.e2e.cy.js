/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests } from '../../../../e2e/util';
import { createIDMUser, deleteIDMUser } from '../api/managedApi.e2e';

filterTests(['forgeops', 'cloud'], () => {
  describe('Enduser Dashboard View', () => {
    let userId = '';
    let userName = '';

    afterEach(() => {
      deleteIDMUser(userId);
      cy.logout();
    });

    it('should show session timeout and extend session', () => {
      // Get an admin access token and use it to create the test user
      cy.loginAsAdmin().then(() => {
        createIDMUser().then(({ body: { userName: responseUserName, _id: responseUserId } }) => {
          const locationUrl = Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/enduser/?realm=alpha#/profile` : `${Cypress.config().baseUrl}/enduser/?realm=root#/profile`;

          userId = responseUserId;
          userName = responseUserName;

          cy.logout();

          // Login to the endusers profile page
          cy.loginAsEnduser(userName);

          cy.findByTestId('session-timeout-warning').should('not.exist');

          const inNinetySeconds = new Date(Date.now() + 85000);
          const maxIdleExpirationTime = inNinetySeconds.toISOString();
          cy.intercept('POST', '**/sessions?_action=getSessionInfo', {
            realm: '/test',
            maxIdleExpirationTime,
          });

          // expect the session warning to be shown
          cy.visit(locationUrl);
          cy.findByTestId('session-timeout-warning', { timeout: 35000 }).within(() => {
            cy.get('button.btn-primary').click();
          });

          // expect the session warning to be dismissed
          cy.findByTestId('session-timeout-warning').should('not.exist');
        });
      });
    });

    it('should show session timeout and end session', () => {
      // Get an admin access token and use it to create the test user
      cy.loginAsAdmin().then(() => {
        createIDMUser().then(({ body: { userName: responseUserName, _id: responseUserId } }) => {
          const locationUrl = Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/enduser/?realm=alpha#/profile` : `${Cypress.config().baseUrl}/enduser/?realm=root#/profile`;

          userId = responseUserId;
          userName = responseUserName;

          cy.logout();

          // Login to the endusers profile page
          cy.loginAsEnduser(userName);

          cy.findByTestId('session-timeout-warning').should('not.exist');

          const inNinetySeconds = new Date(Date.now() + 85000);
          const maxIdleExpirationTime = inNinetySeconds.toISOString();
          cy.intercept('POST', '**/sessions?_action=getSessionInfo', {
            realm: '/test',
            maxIdleExpirationTime,
          });

          // expect the session warning to be shown
          cy.visit(locationUrl);
          cy.findByTestId('session-timeout-warning', { timeout: 35000 }).within(() => {
            cy.get('button.btn-link').click();
          });

          // expect the user to be signed out
          cy.location().should((location) => {
            expect(location.href).to.contain('/am/XUI/');
          });
        });
      });
    });

    it('should not show session timeout if the date is over 24 days from now', () => {
      // settimeout can have an overflow int issue
      // Get an admin access token and use it to create the test user
      cy.loginAsAdmin().then(() => {
        createIDMUser().then(({ body: { userName: responseUserName, _id: responseUserId } }) => {
          const locationUrl = Cypress.env('IS_FRAAS') ? `${Cypress.config().baseUrl}/enduser/?realm=alpha#/profile` : `${Cypress.config().baseUrl}/enduser/?realm=root#/profile`;

          userId = responseUserId;
          userName = responseUserName;

          cy.logout();

          // Login to the endusers profile page
          cy.loginAsEnduser(userName);

          cy.findByTestId('session-timeout-warning').should('not.exist');

          // this put it over 32-bit signed integer
          const inOverTwentyFiveDays = new Date(Date.now() + 2160000000);
          const maxIdleExpirationTime = inOverTwentyFiveDays.toISOString();
          cy.intercept('POST', '**/sessions?_action=getSessionInfo', {
            realm: '/test',
            maxIdleExpirationTime,
          });

          cy.visit(locationUrl);

          cy.findByTestId('session-timeout-warning').should('not.exist');
        });
      });
    });
  });
});
