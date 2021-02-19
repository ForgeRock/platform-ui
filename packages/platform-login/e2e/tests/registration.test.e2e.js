/**
 * Copyright (c) 2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

describe('Registration form', () => {
  const locationUrl = `${Cypress.config().baseUrl}/login/?realm=/&authIndexType=service&authIndexValue=Registration#/`;

  beforeEach(() => {
    cy.visit(locationUrl);

    cy.findByPlaceholderText('Username')
      .type('newTestUser1');

    cy.findByPlaceholderText('First Name')
      .type('newTest');

    cy.findByPlaceholderText('Last Name')
      .type('User1');

    cy.findByPlaceholderText('Email Address')
      .type('newTestUser1@test.com');

    cy.findAllByRole('listbox').first().select('What\'s your favorite color?');
    cy.findAllByPlaceholderText('Answer').first().type('orange');
    cy.findAllByRole('listbox').last().select('Who was your first employer?');
    cy.findAllByPlaceholderText('Answer').last().type('ForgeRock');
  });

  it('missing credentials should show error', () => {
    // no password set - check policy
    cy.get('li:contains("Cannot be blank")')
      .should('not.have.class', 'fr-valid');

    // set short and long passwords - check policy
    cy.findByPlaceholderText('Password')
      .type('2short');

    cy.get('li:contains("Cannot be blank")')
      .should('have.class', 'fr-valid');

    cy.get('li:contains("Must be at least 8 characters long")')
      .should('not.have.class', 'fr-valid');

    cy.findByPlaceholderText('Password')
      .type('longenoughtopass');

    cy.get('li:contains("Must be at least 8 characters long")')
      .should('have.class', 'fr-valid');
  });

  it('creates new user and logs in', () => {
    // set valid password - submit form
    cy.findByPlaceholderText('Password')
      .type('Welcome1')
      .get('[type="submit"]')
      .click();

    cy.location().should((location) => {
      expect(location.pathname).to.eq('/enduser/');
    });
  });
});
