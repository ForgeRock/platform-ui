/**
 * Copyright (c) 2020-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests, retryableBeforeEach } from '../../../../e2e/util';

filterTests(['@forgeops', '@cloud'], () => {
  describe('Login View', () => {
    const userName = Cypress.env('AM_USERNAME');

    retryableBeforeEach(() => {
      cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
    });

    it('location should be at /am/XUI', () => {
      cy.get('.fr-center-card').find('.ping-logo').should('be.visible');
      cy.location().should((location) => {
        expect(location.href).to.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
        expect(location.host).to.eq(Cypress.env('FQDN'));
        expect(location.hostname).to.eq(Cypress.env('FQDN'));
        expect(location.origin).to.eq(`${Cypress.config().baseUrl}`);
        expect(location.pathname).to.eq('/am/XUI/');
        expect(location.port).to.eq('');
        expect(location.protocol).to.eq('https:');
      });
      cy.url().should('eq', `${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
    });

    it('should fail login with incorrect credentials', () => {
      cy.findByLabelText(/User Name/i, { timeout: 20000 }).should('be.visible')
        .type(userName, { force: true })
        .should('have.value', userName);
      cy.findAllByLabelText(/Password/i).first()
        .type(userName, { force: true })
        .should('have.value', userName);
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findAllByRole('alert').contains('Login failure').should('be.visible');
    });

    it('should succeed login with valid credentials', () => {
      cy.loginAsAdmin();
      cy.location().should((location) => {
        expect(location.href).to.not.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
      });
    });

    it('should logout when using am/XUI/logout url', () => {
      cy.loginAsAdmin();
      cy.location().should((location) => {
        expect(location.href).to.not.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
      });

      cy.intercept('GET', '/am/json/serverinfo/*').as('getServerInfo');
      cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/logout`);
      cy.wait('@getServerInfo');
      cy.location().should((location) => {
        expect(location.href).to.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
      });
    });

    it('when using am/UI/Logout url with goto query param, should navigate to am/XUI with goto param to allow am to validate url', () => {
      cy.loginAsAdmin();
      cy.location().should((location) => {
        expect(location.href).to.not.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=/&goto=www.google.com#/`);
      });

      cy.intercept('GET', '/am/json/serverinfo/*').as('getServerInfo');
      cy.visit(`${Cypress.config().baseUrl}/am/UI/Logout?realm=/&goto=www.google.com`);
      cy.wait('@getServerInfo');
      // verify location is at /am/XUI/ with goto param, indicating we would then have goto url validated by am
      cy.location().should((location) => {
        expect(location.href).to.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=/&goto=www.google.com#/`);
      });
    });
  });
});
