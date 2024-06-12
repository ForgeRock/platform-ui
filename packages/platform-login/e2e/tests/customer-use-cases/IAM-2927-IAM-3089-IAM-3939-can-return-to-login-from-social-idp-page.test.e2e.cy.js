/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests } from '../../../../../e2e/util';

// TODO: Disabling out until these tests can be updated to work reliably
const realm = Cypress.env('IS_FRAAS') ? 'alpha' : '/';

filterTests(['@forgeops', '@cloud'], () => {
  describe('IAM-2927, IAM-3089, and IAM-3939 can return to login from social IDP pages without authenticating', () => {
    const referenceTreeUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${realm}&authIndexType=service&authIndexValue=Login`;
    const testTreeWithOneIDPUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${realm}&authIndexType=service&authIndexValue=IAM-3939`;
    const testTreeWithTwoIDPsUrl = `${Cypress.config().baseUrl}/am/XUI/?realm=${realm}&authIndexType=service&authIndexValue=IAM-3089`;

    before(() => {
      // Login as admin and import test Journey with scripts
      cy.importTreesViaAPI(['IAM-3089.json', 'IAM-3939.json']);
      cy.logout();
    });

    after(() => {
      // Login as admin and delete test Journey with scripts
      cy.deleteTreesViaAPI(['IAM-3089.json', 'IAM-3939.json']);
    });

    it('IAM-2927, IAM-3089 can return to the login UI following a social IDP redirect without being directed back to the IDP', () => {
      cy.visit(testTreeWithTwoIDPsUrl);

      cy.log('Check that the two social IDP choices are shown');
      cy.findByRole('button', { name: 'Sign in with Facebook', timeout: 20000 }).should('exist');
      cy.findByRole('button', { name: 'Sign in with Google' }).should('exist');

      cy.log('IAM-3089 - navigating directly to a different tree following a social IDP redirect works');
      cy.findByRole('button', { name: 'Sign in with Facebook' }).click();
      cy.url().should('contain', 'facebook.com');
      cy.visit(referenceTreeUrl);
      cy.findByLabelText('User Name', { timeout: 20000 }).should('exist');
    });

    it('IAM-3939 can return to the login UI following a social IDP redirect from a tree with one IDP option', () => {
      cy.visit(testTreeWithOneIDPUrl);

      cy.log('IAM-3939 - can navigate directly to another tree following a social IDP redirect');
      cy.url().should('contain', 'IAM-3939');
      // redirected automatically
      cy.url().should('contain', 'facebook.com');
      cy.visit(referenceTreeUrl);
      cy.findByLabelText('User Name', { timeout: 20000 }).should('exist');
    });
  });
});
