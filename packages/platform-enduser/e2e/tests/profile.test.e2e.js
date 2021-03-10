/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createIDMUser } from '../api/managedApi.e2e';

describe('Enduser Profile View', () => {
  let userName = '';
  const fullName = 'First Last';
  const permanentlyDeleteMessage = 'Are you sure you want to permanently delete your account data?';
  const locationUrl = `${Cypress.config().baseUrl}/enduser/?realm=root#/profile`;

  before(() => {
    createIDMUser().then((results) => {
      // eslint-disable-next-line prefer-destructuring
      userName = results.body.userName;
    });
  });

  it('should have profile selected', () => {
    cy.login(userName);
    cy.visit(locationUrl);
    cy.get('[href="#/profile"]', { timeout: 30000 })
      .should('exist')
      .should('have.class', 'router-link-active');
  });

  it('should show user image and name', () => {
    cy.login(userName);
    cy.visit(locationUrl);
    cy.get('div.profileCol')
      .get('.b-avatar')
      .should('exist');
    cy.get('div.profileCol .card-body')
      .should('contain', fullName);
  });

  it('should be able to download user data when clicked', () => {
    cy.login(userName);
    cy.visit(locationUrl);
    cy.get('div.accordion').within(() => {
      cy.get('div.card-header.collapsed').eq(0).click();
      cy.get('button.btn-primary')
        .should('contain', 'Download');
      // .click(); Want to figure out a way on BButton to programatically test the request
      // works without actually clicking the button as we can do with <a href>
    });
  });

  it('should open delete account modal when clicked', () => {
    cy.login(userName);
    cy.visit(locationUrl);
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
    cy.login(userName);
    cy.visit(locationUrl);
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
