/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

describe('Login View', () => {
  const userName = Cypress.env('AM_USERNAME');
  const password = Cypress.env('AM_PASSWORD');
  beforeEach(() => {
    cy.visit(`${Cypress.config().baseUrl}/login/?realm=/#/`);
  });

  it('location should be at login', () => {
    cy.get('.fr-center-card').find('.fr-logo').should('be.visible');
    cy.location().should((location) => {
      expect(location.href).to.eq(`${Cypress.config().baseUrl}/login/?realm=/#/`);
      expect(location.host).to.eq(Cypress.env('FQDN'));
      expect(location.hostname).to.eq(Cypress.env('FQDN'));
      expect(location.origin).to.eq(`${Cypress.config().baseUrl}`);
      expect(location.pathname).to.eq('/login/');
      expect(location.port).to.eq('');
      expect(location.protocol).to.eq('https:');
    });
    cy.url().should('eq', `${Cypress.config().baseUrl}/login/?realm=/#/`);
  });

  it('should fail login with incorrect credentials', () => {
    const errorMessage = 'Authentication Failed';
    cy.findByPlaceholderText('User Name:')
      .type(userName)
      .should('have.value', userName);
    cy.findByPlaceholderText('Password:')
      .type(userName, { force: true })
      .should('have.value', userName);
    cy.findByRole('button', { name: 'Next' }).click();
    cy.findByRole('alert').should('contain', errorMessage);
  });

  it('should succeed login with valid credentials', () => {
    cy.findByPlaceholderText('User Name:')
      .type(userName)
      .should('have.value', userName);
    cy.findByPlaceholderText('Password:')
      .type(password, { force: true })
      .should('have.value', password);
    cy.findByRole('button', { name: 'Next' }).click();
    cy.location().should((location) => {
      expect(location.href).to.not.eq(`${Cypress.config().baseUrl}/login/?realm=/#/`);
    });
  });
});
