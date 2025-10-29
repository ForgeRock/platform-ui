/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests, retryableBeforeEach } from '@e2e/util';

filterTests(['@forgeops'], () => {
  describe('Login Page - Visual Tests', () => {
    const userName = Cypress.env('AM_USERNAME');

    retryableBeforeEach(() => {
      cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/`);
      // Wait for page to be fully loaded and stable
      cy.get('[data-testid="callbacks_panel"]', { timeout: 20000 }).should('be.visible');
      cy.get('.ping-logo').should('be.visible');
    });

    it('should capture default login form', () => {
      // Ensure all elements are loaded and visible
      cy.get('.fr-center-card').should('be.visible');
      cy.findByLabelText(/User Name/i, { timeout: 10000 }).should('be.visible');
      cy.findAllByLabelText(/Password/i).first().should('be.visible');
      cy.findByRole('button', { name: 'Next' }).should('be.visible');

      cy.percySnapshot('Login - Default State');
    });

    it('should capture loading spinner state', () => {
      let interceptResolve;

      // Intercept authentication requests and hold them to capture spinner
      cy.intercept('POST', '**/authenticate**', () => new Promise((resolve) => {
        interceptResolve = resolve; // Store resolver for manual control
      })).as('authRequest');

      // Fill form and submit to trigger loading
      cy.findByLabelText(/User Name/i).type(userName);
      cy.findAllByLabelText(/Password/i).first().type('testpassword123');
      cy.findByRole('button', { name: 'Next' }).click();

      // Wait for spinner to appear
      cy.get('.spinner-border', { timeout: 10000 }).should('be.visible');

      // Take snapshot when spinner is definitely visible
      cy.percySnapshot('Login - Loading Spinner');

      // Now allow the intercepted request to complete
      cy.then(() => {
        if (interceptResolve) {
          interceptResolve({ statusCode: 200, body: { message: 'Authentication successful' } });
        }
      });
    });

    it('should capture error state', () => {
      // Fill form with wrong credentials
      cy.findByLabelText(/User Name/i).type(userName, { force: true });
      cy.findAllByLabelText(/Password/i).first().type('wrongpassword', { force: true });
      cy.findByRole('button', { name: 'Next' }).click();

      // Wait for error to appear and be stable
      cy.get('[data-testid="FrAlert"]').contains('Login failure').should('be.visible');

      cy.percySnapshot('Login - Error State');
    });
  });
});
