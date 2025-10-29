/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests, retryableBeforeEach } from '@e2e/util';

filterTests(['@forgeops'], () => {
  describe('Forbidden Page - Visual Tests', () => {
    retryableBeforeEach(() => {
      cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=/#/forbidden`);
      // Wait for page to be fully loaded
      cy.get('body', { timeout: 10000 }).should('be.visible');
    });

    describe('Forbidden View States', () => {
      it('should capture forbidden page layout', () => {
        // Ensure img has loaded
        cy.get('img', { timeout: 5000 }).should('be.visible');

        // Ensure forbidden page elements are visible
        cy.get('p').contains('You are not authorized to view this site.').should('be.visible');

        cy.percySnapshot('Login - Forbidden Page');
      });
    });
  });
});
