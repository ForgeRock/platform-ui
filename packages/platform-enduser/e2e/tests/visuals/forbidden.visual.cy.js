/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { filterTests } from '@e2e/util';
import { createIDMUser, deleteIDMUser } from '@e2e/api/managedApi.e2e';

filterTests(['@forgeops'], () => {
  describe('Forbidden Page - Visual Tests', () => {
    const enduserRealm = Cypress.env('IS_FRAAS') ? 'alpha' : 'root';
    const enduserForbiddenUrl = `${Cypress.config().baseUrl}/enduser/?realm=${enduserRealm}#/forbidden`;
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

    it('should capture forbidden page layout', () => {
      // Login as enduser first
      cy.loginAsEnduser(userName);

      // Navigate to forbidden route
      cy.visit(enduserForbiddenUrl);

      // Wait for page to be fully loaded and dynamic heights calculated
      cy.get('.page-height').should('be.visible');
      cy.get('img[alt="forbidden"]').should('be.visible');

      cy.percySnapshot('Enduser - Forbidden Page');
    });
  });
});
