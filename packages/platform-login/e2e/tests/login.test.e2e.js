/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import filterTests from '../../../../e2e/filter_tests';

const loginFailedErrorMessage = Cypress.env('IS_FRAAS') ? 'Login failure' : 'Authentication Failed';

filterTests(['forgeops', 'cloud'], () => {
  describe('Login View', () => {
    const userName = Cypress.env('AM_USERNAME');

    beforeEach(() => {
      cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
    });

    it('location should be at /am/XUI', () => {
      cy.get('.fr-center-card').find('.fr-logo').should('be.visible');
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
      cy.findByPlaceholderText(/User Name/i)
        .type(userName)
        .should('have.value', userName);
      cy.findByPlaceholderText(/Password/i)
        .type(userName, { force: true })
        .should('have.value', userName);
      cy.findByRole('button', { name: 'Next' }).click();
      cy.findAllByRole('alert').contains(loginFailedErrorMessage);
    });

    it('should succeed login with valid credentials', () => {
      cy.login();
      cy.location().should((location) => {
        expect(location.href).to.not.eq(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
      });
    });
  });
});
