/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests, retryableBeforeEach } from '@e2e/util';
import { createIDMUser, deleteIDMUser } from '@e2e/api/managedApi.e2e';

filterTests(['@forgeops'], () => {
  describe('Enduser Dashboard - Visual Tests', () => {
    let userId = '';
    let userName = '';

    before(() => {
      // Create test user for visual tests.
      cy.loginAsAdminCached().then(() => {
        createIDMUser().then(({ body: { userName: responseUserName, _id: responseUserId } }) => {
          userId = responseUserId;
          userName = responseUserName;
          cy.logout();
        });
      });
    });

    after(() => {
      cy.loginAsAdminCached().then(() => {
        deleteIDMUser(userId);
      });
    });

    retryableBeforeEach(() => {
      cy.loginAsEnduser(userName);
    });

    it('should capture dashboard page', () => {
      cy.findByRole('link', { name: 'Dashboard' }).should('be.visible');
      cy.percySnapshot('Enduser - Dashboard');
    });

    it('should capture profile page', () => {
      cy.findByRole('link', { name: 'Profile' }).click();
      cy.findByRole('link', { name: 'Profile' }).should('have.class', 'router-link-active');
      cy.location('href').should('contain', '#/profile');
      cy.get('div.profileCol').get('.b-avatar').should('be.visible');
      cy.get('div.profileCol .card-body').should('be.visible').should('contain', 'First Last');
      cy.percySnapshot('Enduser - Profile');
    });
  });
});
