/// <reference types="Cypress" />

context('Login View', () => {
  beforeEach(() => {
    cy.visit('#/service/login');
  })

  it('should have logo', () => {
    cy.get('.fr-center-card').find('img').should('be.visible');
  })

  it('location should be at login', () => {
    // http://localhost:8083/#/service/login
    cy.location().should((location) => {
      expect(location.href).to.eq('http://localhost:8083/#/service/login');
      expect(location.host).to.eq('localhost:8083');
      expect(location.hostname).to.eq('localhost');
      expect(location.origin).to.eq('http://localhost:8083');
      expect(location.pathname).to.eq('/');
      expect(location.port).to.eq('8083');
      expect(location.protocol).to.eq('http:');
      expect(location.search).to.be.empty;
    })
  })

  it('should have localhost login url', () => {
    cy.url().should('eq', 'http://localhost:8083/#/service/login')
  })

  it('should fail login with incorrect credentials', () => {
    cy.get('#floatingLabelInput13').type('amadmin');
    cy.get('#floatingLabelInput13').should('have.value', 'amadmin');
    cy.get('#floatingLabelInput15').type('amadmin');
    cy.get('#floatingLabelInput15').should('have.value', 'amadmin');
    cy.get('.btn-primary').click();
    cy.get('.fr-center-card').should('contain', 'Login Failure');
  })

  it('should succeed login with valid credentials', () => {
    cy.get('#floatingLabelInput13').type('amadmin');
    cy.get('#floatingLabelInput13').should('have.value', 'amadmin');
    cy.get('#floatingLabelInput15').type('password');
    cy.get('#floatingLabelInput15').should('have.value', 'password');
    cy.get('.btn-primary').click();
  })
})
