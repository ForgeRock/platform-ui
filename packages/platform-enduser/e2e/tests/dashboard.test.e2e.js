/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import filterTests from '../../../../e2e/filter_tests';
import { createIDMUser, assignUserDashboard } from '../api/managedApi.e2e';
import { setBaseTheme } from '../api/themeApi.e2e';

filterTests(['forgeops'], () => {
  describe('Enduser Dashboard View', () => {
    let userId = '';
    let userName = '';
    const fullName = 'First Last';
    const givenName = 'First';

    before(() => {
      createIDMUser().then((results) => {
        // eslint-disable-next-line prefer-destructuring
        userId = results.body._id;
        userName = results.body.userName;
      });
    });
    it('should have sidebar and navbar with dashboard selected', () => {
      cy.login(userName);
      cy.findByTestId('fr-sidebar-nav').should('exist');
      cy.findByTestId('fr-main-navbar').should('exist');
      cy.findByRole('link', { name: 'Dashboard' })
        .should('have.attr', 'href', '#/dashboard')
        .should('have.class', 'router-link-active');
    });

    it(`should be logged in as ${fullName}`, () => {
      cy.login(userName);
      cy.get('.fr-dropdown-button-content').should('contain', fullName);
      cy.get('.jumbotron')
        .get('div')
        .should('contain', 'Hello,')
        .get('span')
        .should('contain', fullName);
    });

    it('should be able to collapse and expand sidebar', () => {
      cy.login(userName);
      cy.get('.fr-menu-expanded')
        .should('exist')
        .get('.fr-sidebar-nav')
        .should('have.css', 'width', '213.75px');
      cy.get('.fr-menu-collapsed').should('not.exist');
      cy.get('.fr-sidebar-bottom').click();
      cy.get('.fr-menu-collapsed').should('exist');
      cy.get('.fr-sidebar-bottom').click();
      cy.get('.fr-menu-collapsed').should('not.exist');
    });

    it('should allow user dropdown to show', () => {
      cy.login(userName);
      cy.get('.dropdown-menu.show').should('not.exist');
      cy.get('button.dropdown-toggle').click({ force: true });
      cy.get('.dropdown-menu.show')
        .should('exist');
      cy.get('.dropdown-menu.show')
        .should('exist');
      cy.get('button.dropdown-toggle').click({ force: true });
    });

    // Disabled as we are not using notification dropdown currently
    // it('should show notification dropdown', () => {
    //   verifyLogin();
    //   cy.get('.fr-notification-icon')
    //     .should('exist')
    //     .click()
    //     .get('.dropdown-menu.show')
    //     .should('be.visible')
    //     .get('.fr-notification-header')
    //     .should('contain', 'Notifications (0)');
    // });

    it('should be able to edit profile', () => {
      cy.login(userName);
      cy.get('.jumbotron')
        .get('button.btn-primary')
        .should('contain', 'Edit Your Profile')
        .click();
    });

    it('should allow user to log out', () => {
      cy.login(userName);
      cy.get('button.dropdown-toggle').click();
      cy.get('.dropdown-menu.show')
        .get('a.dropdown-item')
        .last()
        .should('exist')
        .should('contain', 'Sign out')
        .click();
    });

    it('should show compact header on enduser login with applications dashboard enabled', () => {
      const dashboards = ['Google', 'Zendesk', 'salesforce'];
      assignUserDashboard(userId, dashboards).then(() => {
        cy.logout();
        cy.clock(new Date(2021, 4, 29, 11, 19, 11), ['Date']);
        cy.login(userName);
        cy.get('.fr-dropdown-button-content').should('contain', fullName);
        cy.get('h1')
          .should('contain', `Good Morning ${givenName}!`);
        cy.get('p')
          .should('contain', "Here's a look at what's going on.");
      });
    });

    it('should delete test user', () => {
      const platformLoginUrl = `${Cypress.config().baseUrl}/platform/`;
      const adminUserName = Cypress.env('AM_USERNAME');
      const adminPassword = Cypress.env('AM_PASSWORD');
      cy.intercept('POST', '/am/oauth2/access_token').as('getAccessToken');
      cy.login(adminUserName, adminPassword, platformLoginUrl).then(() => {
        cy.wait('@getAccessToken').then(({ response }) => {
          const accessToken = response.body.access_token;
          setBaseTheme(accessToken);
        });
      });
      cy.logout();
      cy.login(userName);
      const permanentlyDeleteMessage = 'Are you sure you want to permanently delete your account data?';
      cy.get('[href="#/profile"]:first').click();
      cy.get('h5.mb-0:last')
        .should('exist')
        .should('contain', 'Delete Account')
        .click();
      cy.get('button.btn-danger:last')
        .should('exist')
        .click();
      cy.get('div.modal-body').should('contain', permanentlyDeleteMessage);
      cy.get('footer.modal-footer').within(() => {
        cy.get('button.btn-danger')
          .should('be.enabled')
          .should('contain', 'Delete Account')
          .click();
      });
    });
  });
});
