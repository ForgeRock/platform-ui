/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

describe('Recovery Pages - Visual Tests', { tags: '@forgeops' }, () => {
  const loginRealm = Cypress.env('IS_FRAAS') ? '/alpha' : '/';

  it('[TC-12172] Should capture forgot username page', () => {
    cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=ForgottenUsername#/`);
    // Wait for input field to be rendered
    cy.findByLabelText('Email Address').should('be.visible');
    cy.percySnapshot('Login - Forgot Username Page');
  });

  it('[TC-12173] Should capture reset password page', () => {
    cy.visit(`${Cypress.config().baseUrl}/am/XUI/?realm=${loginRealm}&authIndexType=service&authIndexValue=ResetPassword#/`);
    // Wait for input field to be rendered
    cy.findByLabelText('Email Address').should('be.visible');
    cy.percySnapshot('Login - Reset Password Page');
  });
});
