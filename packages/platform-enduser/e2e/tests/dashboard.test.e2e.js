/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { loginUser, createIDMTestUser } from '../managedApi.e2e';

describe('Enduser Dashboard View', () => {
  let userName = '';
  const password = 'Welcome1';
  const fullName = 'First Last';
  const permanentlyDeleteMessage = 'Are you sure you want to permanently delete your account data?';
  const locationUrl = `https://${Cypress.env('FQDN')}/enduser/?realm=root#/dashboard`;
  const verifyLogin = () => {
    cy.server().route('/am/json/realms/root/realms/root/dashboard/assigned').as('verifyPageLoad');
    cy.get('.text-center').then(($text) => {
      if ($text.hasClass('mb-4') || $text.hasClass('mb-0')) {
        cy.get('[placeholder="User Name:"]')
          .type(userName)
          .should('have.value', userName);
        cy.get('[placeholder="Password:"]')
          .type(password, { force: true })
          .should('have.value', password);
        cy.get('.btn-primary').click();
        cy.get('img[alt="ForgeRock"]', { timeout: 60000 }).should('be.visible');
      } else {
        loginUser.then(() => {
          cy.visit(locationUrl);
          cy.wait(2000);
          cy.get('img[alt="ForgeRock"]', { timeout: 60000 }).should('be.visible');
        });
      }
    });
    cy.location('pathname', { timeout: 20000 }).should('include', '/enduser/');
    cy.wait('@verifyPageLoad', { timeout: 20000 });
  };

  before(() => {
    createIDMTestUser().then((results) => {
      // eslint-disable-next-line prefer-destructuring
      userName = results.body.userName;
    });
  });

  beforeEach(() => {
    cy.visit(locationUrl);
  });

  it('should have sidebar and navbar with dashboard selected', () => {
    verifyLogin();
    cy.get('.fr-sidebar-wrapper').should('exist');
    cy.get('.fr-main-navbar').should('exist');
    cy.get('[href="#/dashboard"]')
      .should('exist')
      .should('have.css', 'background-color', 'rgb(228, 244, 253)')
      .should('have.css', 'border-left-color', 'rgb(16, 156, 241)');
  });

  it(`should be logged in as ${fullName}`, () => {
    verifyLogin();
    cy.get('.fr-dropdown-button-content').should('contain', fullName);
  });

  it('should be able to collapse and expand sidebar', () => {
    verifyLogin();
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
    verifyLogin();
    cy.get('.dropdown-menu.show').should('not.exist');
    cy.get('button.dropdown-toggle').click({ force: true });
    cy.get('.dropdown-menu.show')
      .should('exist');
    cy.get('.dropdown-menu.show')
      .should('exist')
      .get('.dropdown-header h5')
      .should('contain', 'ForgeRock');
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

  it('should have welcome message', () => {
    verifyLogin();
    cy.get('.jumbotron')
      .should('contain', `Hello, ${fullName}`)
      .should('contain', 'The ForgeRock End User UI ');
  });

  it('should be able to edit profile', () => {
    verifyLogin();
    cy.get('.jumbotron')
      .get('button.btn-primary')
      .should('contain', 'Edit Your Profile')
      .click();
  });

  it('should allow user to log out', () => {
    verifyLogin();
    cy.get('button.dropdown-toggle').click();
    cy.get('.dropdown-menu.show')
      .get('a.dropdown-item')
      .should('exist')
      .should('contain', 'Sign out')
      .click();
  });

  it('should delete test user', () => {
    verifyLogin();
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
