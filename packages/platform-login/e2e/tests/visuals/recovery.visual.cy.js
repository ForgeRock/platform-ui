/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests } from '@e2e/util';

filterTests(['@forgeops'], () => {
  describe('Recovery Pages - Visual Tests', () => {
    const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';

    it('should capture forgot username page', () => {
      cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=ForgottenUsername#/`);
      // Wait for input field to be rendered
      cy.findByLabelText('Email Address').should('be.visible');
      cy.percySnapshot('Login - Forgot Username Page');
    });

    it('should capture reset password page', () => {
      cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=ResetPassword#/`);
      // Wait for input field to be rendered
      cy.findByLabelText('Email Address').should('be.visible');
      cy.percySnapshot('Login - Reset Password Page');
    });
  });
});
