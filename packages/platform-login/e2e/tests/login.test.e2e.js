/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

context('Login View', () => {
  beforeEach(() => {
    cy.visit('#/service/Login');
  });

  it('should have logo', () => {
    cy.get('.fr-center-card').find('img').should('be.visible');
  });

  it('location should be at login', () => {
    cy.location().should((location) => {
      expect(location.href).to.eq('http://localhost:8083/#/service/Login');
      expect(location.host).to.eq('localhost:8083');
      expect(location.hostname).to.eq('localhost');
      expect(location.origin).to.eq('http://localhost:8083');
      expect(location.pathname).to.eq('/');
      expect(location.port).to.eq('8083');
      expect(location.protocol).to.eq('http:');
    });
  });

  it('should have localhost login url', () => {
    cy.url().should('eq', 'http://localhost:8083/#/service/Login');
  });

  it('should fail login with incorrect credentials', () => {
    cy.get('[placeholder="Username"]').type('amadmin');
    cy.get('[placeholder="Username"]').should('have.value', 'amadmin');
    cy.get('[placeholder="Password"]').type('password', { force: true });
    cy.get('[placeholder="Password"]').should('have.value', 'amadmin');
    cy.get('.btn-primary').click();
    cy.get('.fr-center-card').should('contain', 'Login Failure');
  });

  it('should succeed login with valid credentials', () => {
    cy.get('[placeholder="Username"]').type('amadmin');
    cy.get('[placeholder="Username"]').should('have.value', 'amadmin');
    cy.get('[placeholder="Password"]').type('password', { force: true });
    cy.get('[placeholder="Password"]').should('have.value', 'password');
    cy.get('.btn-primary').click();
  });
});
