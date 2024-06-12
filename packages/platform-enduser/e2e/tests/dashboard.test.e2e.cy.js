/**
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests } from '../../../../e2e/util';
import { createIDMUser, deleteIDMUser, assignUserDashboard } from '../api/managedApi.e2e';

filterTests(['@forgeops', '@cloud'], () => {
  describe('Enduser Dashboard View', () => {
    let userId = '';
    let userName = '';
    const fullName = 'First Last';
    // const givenName = 'First';

    afterEach(() => {
      deleteIDMUser(userId);
      cy.logout();
    });

    it('should show basic dashboard functionality', () => {
      // Get an admin access token and use it to create the test user
      cy.loginAsAdmin().then(() => {
        createIDMUser().then(({ body: { userName: responseUserName, _id: responseUserId } }) => {
          userId = responseUserId;
          userName = responseUserName;
          cy.logout();

          // Login to the endusers profile page
          cy.loginAsEnduser(userName);

          // Check for existence of the sidebar and that the dashboard shows as selected
          cy.findByTestId('fr-sidebar-nav').should('exist');
          cy.findByTestId('fr-main-navbar').should('exist');
          cy.findByRole('link', { name: 'Dashboard' })
            .should('have.attr', 'href', '#/dashboard')
            .should('have.class', 'router-link-active');

          // Check that the full name is shown
          cy.get('.fr-dropdown-button-content').should('contain', fullName);
          cy.get('.jumbotron')
            .get('div')
            .should('contain', 'Hello,')
            .get('span')
            .should('contain', fullName);

          // Check that the sidebar can be collapsed and expanded
          cy.get('.fr-menu-expanded')
            .should('exist')
            .get('.fr-sidebar-nav');
          // .should('have.css', 'width', '213.75px');
          cy.get('.fr-menu-collapsed').should('not.exist');
          // cy.get('.fr-sidebar-bottom').click();
          // cy.get('.fr-menu-collapsed').should('exist');
          // cy.get('.fr-sidebar-bottom').click();
          cy.get('.fr-menu-collapsed').should('not.exist');

          // Check that the user dropdown can show
          cy.get('.dropdown-menu.show').should('not.exist');
          cy.get('button.dropdown-toggle').click({ force: true });
          cy.get('.dropdown-menu.show')
            .should('exist');
          cy.get('.dropdown-menu.show')
            .should('exist');
          cy.get('button.dropdown-toggle').click({ force: true });

          // Check that the user can navigate to their profile
          cy.get('.jumbotron')
            .get('button.btn-primary')
            .should('contain', 'Edit Your Profile')
            .click();

          // Check that the profile page is shown
          cy.get('[href="#/profile"]', { timeout: 30000 })
            .should('exist')
            .should('have.class', 'router-link-active');
        });
      });
    });

    it.skip('should show compact header on enduser login with applications dashboard enabled', () => {
      const dashboards = ['Google', 'Zendesk', 'salesforce'];

      // Get an admin access token and use it to create the test user
      cy.loginAsAdmin().then(() => {
        createIDMUser().then(({ body: { userName: responseUserName, _id: responseUserId } }) => {
          userId = responseUserId;
          userName = responseUserName;

          // Assign the test dashboards to the user
          assignUserDashboard(userId, dashboards);

          cy.logout();

          // Set the time in Cypress to ensure that the 'good morning' message is shown in the compact dashboard
          cy.clock(new Date(2021, 4, 29, 11, 19, 11), ['Date']);

          // Login to the endusers profile page
          cy.loginAsEnduser(userName);

          // Check that the compact header is shown
          // cy.findByRole('heading', { name: `Good Morning ${givenName}!` });
          // cy.contains('Here\'s a look at what\'s going on.').should('exist');

          // Check that the assigned dashboards are present
          // cy.contains('Google').should('exist');
          // cy.contains('SalesForce').should('exist');
          // cy.contains('ZenDesk').should('exist');
        });
      });
    });
  });
});
