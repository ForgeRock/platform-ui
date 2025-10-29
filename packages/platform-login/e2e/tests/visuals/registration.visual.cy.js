/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests } from '@e2e/util';

filterTests(['@forgeops'], () => {
  describe('Registration Page - Visual Tests', () => {
    const locationUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=/&authIndexType=service&authIndexValue=Registration#/`;
    // Visual regression tests for registration page
    it('should capture registration form states', () => {
      cy.visit(locationUrl);
      cy.findByLabelText('Username').type('testuser123');
      cy.findByLabelText('First Name').type('Test');

      cy.percySnapshot('Login - Registration Form Partial');

      cy.findByLabelText('Password').type('Password@1234');

      cy.percySnapshot('Login - Registration Form Complete');

      cy.findByRole('link', { name: 'Terms & Conditions' }).click();

      cy.percySnapshot('Login - Terms Modal');
    });

    it('should capture first security questions dropdown', () => {
      cy.visit(locationUrl);

      // Wait for page to fully load
      cy.get('.card-body').should('be.visible');

      // Click the first security question dropdown using combobox role
      cy.findAllByRole('combobox').first().should('be.visible').click();
      cy.get('[role="listbox"]').should('be.visible');
      cy.percySnapshot('Login - Security Questions Dropdown');
    });

    it('should capture security question selection - favorite color', () => {
      cy.visit(locationUrl);

      // Wait for page to fully load
      cy.get('.card-body').should('be.visible');

      // Click the first security question dropdown using combobox role
      cy.findAllByRole('combobox').first().should('be.visible').click();
      cy.get('[role="listbox"]').should('be.visible');

      // Select the favorite color option
      cy.get('[role="option"]').contains("What's your favorite color?").click();

      // Wait for selection to be applied
      cy.findAllByLabelText("Answer for: What's your favorite color?").first().should('be.visible');

      cy.percySnapshot('Login - Security Question Selected');
    });

    it('should capture custom security question input', () => {
      cy.visit(locationUrl);

      // Wait for page to fully load
      cy.get('.card-body').should('be.visible');

      // Click the first security question dropdown using combobox role
      cy.findAllByRole('combobox').first().should('be.visible').click();
      cy.get('[role="listbox"]').should('be.visible');

      // Select the "Provide your own" option
      cy.get('[role="option"]').contains('Provide your own:').click();

      cy.percySnapshot('Login - Custom Security Question');
    });

    it('should capture second security questions dropdown', () => {
      cy.visit(locationUrl);

      // Wait for page to fully load
      cy.get('.card-body').should('be.visible');

      // Only test second security question if not in FRaaS (Cloud) environment
      if (!Cypress.env('IS_FRAAS')) {
        // Ensure there are multiple security question dropdowns
        cy.findAllByRole('combobox').should('have.length.greaterThan', 1);

        // Click the last (second) security question dropdown using combobox role
        cy.findAllByRole('combobox').last().click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.percySnapshot('Login - Second Security Question');
      } else {
        // Skip test for Cloud environments that only have one security question
        cy.log('Second security question not available in Cloud environment - skipping test');
        this.skip();
      }
    });
  });
});
