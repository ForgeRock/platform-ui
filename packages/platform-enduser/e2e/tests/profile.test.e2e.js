/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { loginUser, createIDMTestUser } from '../managedApi.e2e';

describe('Enduser Profile View', () => {
  let userName = '';
  const password = 'Welcome1';
  const fullName = 'First Last';
  const permanentlyDeleteMessage = 'Are you sure you want to permanently delete your account data?';
  const locationUrl = `${Cypress.config().baseUrl}/enduser/?realm=root#/profile`;
  const verifyLogin = () => {
    cy.server().route('/am/json/selfservice/trees').as('verifyPageLoad');
    cy.get('.text-center').then(($text) => {
      if ($text.hasClass('mb-4') || $text.hasClass('mb-0')) {
        cy.get('[placeholder="User Name:"]')
          .type(userName)
          .should('have.value', userName);
        cy.get('[placeholder="Password:"]')
          .type(password, { force: true })
          .should('have.value', password);
        cy.get('.btn-primary').click();
        cy.get('.fr-logo', { timeout: 60000 }).should('be.visible');
      } else {
        loginUser(userName, password).then(() => {
          cy.visit(locationUrl);
          cy.wait(2000);
          cy.get('.fr-logo', { timeout: 60000 }).should('be.visible');
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

  it('should have profile selected', () => {
    verifyLogin();
    cy.get('[href="#/profile"]', { timeout: 30000 })
      .should('exist')
      .should('have.css', 'background-color', 'rgb(228, 244, 253)')
      .should('have.css', 'border-left-color', 'rgb(16, 156, 241)');
  });

  it('should show user image and name', () => {
    verifyLogin();
    cy.get('div.profileCol')
      .get('img.rounded-circle')
      .should('exist');
    cy.get('div.profileCol')
      .get('.text-muted')
      .should('contain', fullName);
  });

  it('should be able to download user data when clicked', () => {
    verifyLogin();
    cy.get('div.accordion').within(() => {
      cy.get('div.card-header.collapsed').eq(0).click();
      cy.get('button.btn-primary')
        .should('contain', 'Download');
      // .click(); Want to figure out a way on BButton to programatically test the request
      // works without actually clicking the button as we can do with <a href>
    });
  });

  it('should open delete account modal when clicked', () => {
    verifyLogin();
    cy.get('div.accordion').within(() => {
      cy.get('div.card-header').contains('Delete Account').click();
    });
    cy.get('button.btn-danger:last')
      .should('exist')
      .click();
    cy.get('h5.modal-title').should('contain', 'Permanently Delete Your Account?');
    cy.get('button.text-danger:visible').contains('Cancel').click();
    cy.get('h5.modal-title').should('not.exist');
  });

  it('should be able to delete account', () => {
    verifyLogin();
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
