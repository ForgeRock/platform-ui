/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

context('Dashboard View', () => {
  const userName = 'openidm-admin';
  beforeEach(() => {
    cy.visit('#/dashboard');
    cy.get('img.mb-3').then(($img) => {
      if ($img.hasClass('fr-logo')) {
        cy.get('[placeholder="Username"]').type('amadmin');
        cy.get('[placeholder="Username"]').should('have.value', 'amadmin');
        cy.get('[placeholder="Password"]').type('password', { force: true });
        cy.get('[placeholder="Password"]').should('have.value', 'password');
        cy.get('.btn-primary').click();
      }
    });
  });

  it('should have sidebar and navbar', () => {
    cy.get('.fr-sidebar-wrapper').should('exist');
    cy.get('.fr-main-navbar').should('exist');
  });

  it('should have dashboard selected', () => {
    cy.get('[href="#/dashboard"]')
      .should('exist')
      .should('have.css', 'background-color', 'rgb(228, 244, 253)')
      .should('have.css', 'border-left-color', 'rgb(16, 156, 241)');
  });

  it('should have logo', () => {
    cy.get('.fr-dropdown-button').find('img').should('be.visible');
  });

  it(`should be logged in as ${userName}`, () => {
    cy.get('.fr-dropdown-button').should('contain', userName);
  });

  it('should have collapsed sidebar', () => {
    cy.get('.fr-menu-unlocked')
      .should('exist')
      .get('.fr-sidebar-nav')
      .should('have.css', 'width', '60px');
    cy.get('.fr-menu-locked').should('not.exist');
  });

  it('should be able to expand sidebar', () => {
    cy.get('.fr-sidebar-bottom').click();
    cy.get('.fr-menu-locked').should('exist');
  });

  it('should allow user dropdown to show', () => {
    cy.get('.dropdown-menu.show').should('not.exist');
    cy.get('.fr-dropdown-button').click();
    cy.get('.dropdown-menu.show')
      .should('exist');
  });

  it('dropdown should have user info, and admin button', () => {
    cy.get('.fr-dropdown-button').click();
    cy.get('.dropdown-menu.show')
      .should('exist')
      .get('.dropdown-header h5')
      .should('contain', 'ForgeRock');
    cy.get('.dropdown-menu.show')
      .get('a.dropdown-item:first')
      .should('exist')
      .should('contain', 'Admin')
      .get('i.material-icons-outlined')
      .should('exist');
  });

  it('should show notification dropdown', () => {
    cy.get('.fr-notification-icon')
      .should('exist')
      .click()
      .get('.dropdown-menu.show')
      .should('be.visible')
      .get('.fr-notification-header')
      .should('contain', 'Notifications (0)');
  });

  it('should have welcome message', () => {
    cy.get('.jumbotron')
      .should('contain', `Hello, ${userName}`)
      .should('contain', 'The ForgeRock End User UI ');
  });

  it('should be able to edit profile', () => {
    cy.get('.jumbotron')
      .get('button.btn-primary')
      .should('contain', 'Edit Your Profile')
      .click();
  });

  it('should allow user to log out', () => {
    cy.get('.fr-dropdown-button').click();
    cy.get('.dropdown-menu.show')
      .get('a.dropdown-item:last')
      .should('exist')
      .should('contain', 'Sign Out')
      .click();
  });
});
