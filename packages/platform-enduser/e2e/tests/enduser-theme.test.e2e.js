/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createIDMTestUser } from '../managedApi.e2e';

describe('Enduser Theming', () => {
  const platformLoginUrl = `${Cypress.config().baseUrl}/platform/`;
  const locationUrl = `${Cypress.config().baseUrl}/platform/?realm=root#/realm/theme`;
  let enduserUserName = '';
  const adminUserName = Cypress.env('AM_USERNAME');
  const adminPassword = Cypress.env('AM_PASSWORD');

  before(() => {
    createIDMTestUser().then((results) => {
      enduserUserName = results.body.userName;
    });
  });

  it('should change enduser colors', () => {
    cy.login(adminUserName, adminPassword, platformLoginUrl);

    cy.visit(locationUrl);
    cy.get('#appContent a.nav-link:visible')
      .contains('Theme')
      .click();

    cy.get('div:visible').contains('Link Color').scrollIntoView().click();
    cy.get('.b-popover:visible').should('exist');
    cy.get('input.vc-input__input:visible').clear().type('16FF96');
    cy.get('label.btn.btn-outline-primary').contains('Styles').click();
    cy.get('.b-popover').should('not.exist', { timeout: 15000 });

    cy.get('div:visible').contains('Link Active Color').scrollIntoView().click();
    cy.get('.b-popover:visible').should('exist');
    cy.get('input.vc-input__input:visible').clear().type('123123');
    cy.get('label.btn.btn-outline-primary').contains('Styles').click();
    cy.get('.b-popover').should('not.exist', { timeout: 15000 });

    cy.get('div:visible').contains('Profile Background Color').scrollIntoView().click();
    cy.get('.b-popover:visible').should('exist');
    cy.get('input.vc-input__input:visible').clear().type('FFFFFF');
    cy.get('label.btn.btn-outline-primary').contains('Styles').click();
    cy.get('.b-popover').should('not.exist', { timeout: 15000 });

    cy.get('div:visible').contains('Profile Menu Highlight Color').scrollIntoView().click();
    cy.get('.b-popover:visible').should('exist');
    cy.get('input.vc-input__input:visible').clear().type('123123');
    cy.get('label.btn.btn-outline-primary').contains('Styles').click();
    cy.get('.b-popover').should('not.exist', { timeout: 15000 });

    cy.get('div:visible').contains('Profile Menu Highlight Text Color').scrollIntoView().click();
    cy.get('.b-popover:visible').should('exist');
    cy.get('input.vc-input__input:visible').clear().type('16FF96');
    cy.get('label.btn.btn-outline-primary').contains('Styles').click();
    cy.get('.b-popover').should('not.exist', { timeout: 15000 });

    cy.get('button.btn-primary:visible').contains('Save').scrollIntoView().click();
    cy.logout();
    cy.login(enduserUserName);
    cy.visit(`${Cypress.config().baseUrl}/enduser/?realm=root#/profile`);
    cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)');
    cy.get('a.collapsed').contains('Reset').should('have.css', 'color', 'rgb(22, 255, 150)');
    cy.get('#app .router-link-active').should('have.css', 'background-color', 'rgb(18, 49, 35)');
  });

  it('should change profile page logo', () => {
    cy.login(adminUserName, adminPassword, platformLoginUrl);

    cy.visit(locationUrl);
    cy.get('#appContent a.nav-link:visible')
      .contains('Theme')
      .click();
    cy.get('label.btn.btn-outline-primary')
      .contains('Logo')
      .click();
    cy.get('[placeholder="Profile Page Logo (optional)"]')
      .type('h', { force: true });
    cy.get('.text-center img')
      .should('have.attr', 'src')
      .should('include', 'h', { timeout: 20000 });
    cy.get('label.btn.btn-outline-primary')
      .should('have.class', 'active');
    cy.get('[placeholder="Profile Page Logo (optional)"]')
      .scrollIntoView()
      .click()
      .focused()
      .clear()
      .should('have.value', '')
      .type('https://www.logosurfer.com/wp-content/uploads/2018/03/quicken-loans-logo_0.png')
      .should('have.value', 'https://www.logosurfer.com/wp-content/uploads/2018/03/quicken-loans-logo_0.png');
    cy.get('button.btn-primary:visible').contains('Save').click();
    cy.logout();
    cy.login(enduserUserName);
    cy.get('div.fr-logo:visible')
      .should('have.css', 'background-image', 'url("https://www.logosurfer.com/wp-content/uploads/2018/03/quicken-loans-logo_0.png")');
  });

  it('should delete test user', () => {
    cy.login(enduserUserName);
    const permanentlyDeleteMessage = 'Are you sure you want to permanently delete your account data?';
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
