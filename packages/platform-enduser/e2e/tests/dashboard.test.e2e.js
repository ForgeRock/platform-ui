/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createIDMTestUser } from '../managedApi.e2e';

describe('Enduser Dashboard View', () => {
  let userName = '';
  const fullName = 'First Last';

  before(() => {
    createIDMTestUser().then((results) => {
      // eslint-disable-next-line prefer-destructuring
      userName = results.body.userName;
    });
  });

  it('should have sidebar and navbar with dashboard selected', () => {
    cy.login(userName);
    cy.get('.fr-sidebar-wrapper').should('exist');
    cy.get('.fr-main-navbar').should('exist');
    cy.get('[href="#/dashboard"]')
      .should('exist')
      .should('have.class', 'router-link-active');
  });

  it(`should be logged in as ${fullName}`, () => {
    cy.login(userName);
    cy.get('.fr-dropdown-button-content').should('contain', fullName);
    cy.get('.jumbotron')
      .should('contain', `Hello, ${fullName}`);
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

  it('should delete test user', () => {
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
