/// <reference types="Cypress" />

context('Profile View', () => {
  const userName = 'openidm-admin';
  const permanentlyDeleteMessage = 'Yes, I want to permanently delete my account';
  beforeEach(() => {
    cy.visit('#/profile');
    cy.get('.text-center').then(($text) => {
      if ($text.hasClass('mb-0')) {
        cy.get('#floatingLabelInput14').type('amadmin');
        cy.get('#floatingLabelInput14').should('have.value', 'amadmin');
        cy.get('#floatingLabelInput16').type('password', {force: true});
        cy.get('#floatingLabelInput16').should('have.value', 'password');
        cy.get('.btn-primary').click();
      }
    });
  })

  it('location should be at profile', () => {
    // http://localhost:8888/#/profile
    cy.location().should((location) => {
      expect(location.host).to.eq('localhost:8888');
      expect(location.hostname).to.eq('localhost');
      expect(location.origin).to.eq('http://localhost:8888');
      expect(location.pathname).to.eq('/');
      expect(location.port).to.eq('8888');
      expect(location.protocol).to.eq('http:');
      expect(location.search).to.be.empty;
    })
  })

  it('should have sidebar and navbar', () => {
    cy.get('.fr-sidebar-wrapper').should('exist');
    cy.get('.fr-main-navbar').should('exist');
  })

  it('should have profile selected', () => {
    cy.get('[href="#/profile"]')
      .should('exist')
      .should('have.css', 'background-color', 'rgb(228, 244, 253)')
      .should('have.css', 'border-left-color', 'rgb(16, 156, 241)');
  })

  it('should show user image and name', () => {
    const profileColumn = cy.get('div.profileCol');
    profileColumn
      .get('img.rounded-circle')
      .should('exist');
    profileColumn
      .get('.text-muted')
      .should('contain', userName);
  })

  it('should have account controls in center tabs', () => {
    cy.get('div.tabs').within(($tabs) => {
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
  })

  it('should be able to download user data when clicked', () => {
    cy.get('div.tabs').within(($tabs) => {
      cy.get('div.media a').each(($a) => {
        const href = $a.prop("href");
        expect($a).to.have.attr('href', '#');
  
        // make a programatic request to it
        // which will fail if not 2xx response code
        cy.request(href);
      });
    });
  })

  it('should open delete account modal when clicked', () => {
    cy.get('div.tabs').within(($tabs) => {
      cy.get('div.media').eq(1).click();
    });
    cy.get('h5.modal-title').should('contain', 'Delete your account');
    cy.get('button.close').click();
    cy.get('h5.modal-title').should('not.exist');
  })

  it('should be able to delete account', () => {
    cy.get('div.tabs').within(($tabs) => {
      cy.get('div.media').eq(1).click();
    });
    cy.get('div.modal-body').within(($modalBody) => {
      const checkbox = cy.get('input.custom-control-input');

      cy.get('label.custom-control-label').should('contain', permanentlyDeleteMessage);
      checkbox.should('not.be.checked');
      cy.get('label.custom-control-label').click();
      // TODO: This does not appear to be the actual checkbox, figure out what it is
      // checkbox.should('be.checked');
    });

    cy.get('footer.modal-footer').within(($modalFooter) => {
      const dangerButton = cy.get('button.btn-danger');
      dangerButton.should('be.enabled');
      dangerButton.should('contain', 'Delete Account');
      // We don't actually want to delete the account
    });
    cy.get('button.close').click();
  })
})
