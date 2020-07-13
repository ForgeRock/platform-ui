/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

context('Profile View', () => {
  const userName = 'openidm-admin';
  const permanentlyDeleteMessage = 'Yes, I want to permanently delete my account';
  beforeEach(() => {
    cy.visit('#/profile');
    cy.get('.text-center').then(($text) => {
      if ($text.hasClass('mb-0')) {
        cy.get('[placeholder="Username"]').type('amadmin');
        cy.get('[placeholder="Username"]').should('have.value', 'amadmin');
        cy.get('[placeholder="Password"]').type('password', { force: true });
        cy.get('[placeholder="Password"]').should('have.value', 'password');
        cy.get('.btn-primary').click();
      }
    });
  });

  it('location should be at profile', () => {
    // http://localhost:8888/#/profile
    cy.location().should((location) => {
      expect(location.hostname).to.eq('localhost');
      expect(location.pathname).to.eq('/');
      expect(location.protocol).to.eq('http:');
    });
  });

  it('should have sidebar and navbar', () => {
    cy.get('.fr-sidebar-wrapper').should('exist');
    cy.get('.fr-main-navbar').should('exist');
  });

  it('should have profile selected', () => {
    cy.get('[href="#/profile"]')
      .should('exist')
      .should('have.css', 'background-color', 'rgb(228, 244, 253)')
      .should('have.css', 'border-left-color', 'rgb(16, 156, 241)');
  });

  it('should show user image and name', () => {
    cy.get('div.profileCol')
      .get('img.rounded-circle')
      .should('exist');
    cy.get('div.profileCol')
      .get('.text-muted')
      .should('contain', userName);
  });

  it('should have account controls in center tabs', () => {
    cy.get('div.tabs').within(() => {
      cy.get('a.nav-link')
        .should('have.css', 'color', 'rgb(16, 156, 241)');
      cy.get('[href="#"]')
        .each(($a, index) => {
          if (index === 1) {
            expect($a).to.contain('Download');
          } else if (index === 2) {
            expect($a).to.contain('Delete Account');
          }
        });
    });
  });

  it('should be able to download user data when clicked', () => {
    cy.get('div.tabs').within(() => {
      cy.get('div.media a').each(($a) => {
        const href = $a.prop('href');
        expect($a).to.have.attr('href', '#');

        // make a programatic request to it
        // which will fail if not 2xx response code
        cy.request(href);
      });
    });
  });

  it('should open delete account modal when clicked', () => {
    cy.get('div.tabs').within(() => {
      cy.get('div.media').eq(1).click();
    });
    cy.get('h5.modal-title').should('contain', 'Delete your account');
    cy.get('button.close').click();
    cy.get('h5.modal-title').should('not.exist');
  });

  it('should be able to delete account', () => {
    cy.get('div.tabs').within(() => {
      cy.get('div.media').eq(1).click();
    });
    cy.get('div.modal-body').within(() => {
      cy.get('label.custom-control-label').should('contain', permanentlyDeleteMessage);
      cy.get('input.custom-control-input').should('not.be.checked');
      cy.get('label.custom-control-label').click();
      // TODO: This does not appear to be the actual checkbox, figure out what it is
      // cy.get('input.custom-control-input').should('be.checked');
    });

    cy.get('footer.modal-footer').within(() => {
      cy.get('button.btn-danger')
        .should('be.enabled')
        .should('contain', 'Delete Account');
      // We don't actually want to delete the account
    });
    cy.get('button.close').click();
  });
});
