/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Before } from '@badeball/cypress-cucumber-preprocessor';
import { deleteIDMUser } from '@e2e/api/managedApi.e2e';

// Scope fresh-session enforcement only for the ForgeOps success login scenario
Before({ tags: '@C29566' }, () => {
  cy.then(() => {
    if (Cypress.session && typeof Cypress.session.clearAllSavedSessions === 'function') {
      Cypress.session.clearAllSavedSessions();
    }
  });
  cy.logout();
});

after(() => {
  if (Cypress.spec.relative.includes('admin-login.feature') && Cypress.env('endUserId')) {
    cy.loginAsAdminCachedForCucumber();
    cy.log(`Deleting created IDM end user ${Cypress.env('endUserName')} via API`).then(() => {
      deleteIDMUser(Cypress.env('endUserId'));
      Cypress.env('endUserName', '');
      Cypress.env('endUserFirstName', '');
      Cypress.env('endUserLastName', '');
      Cypress.env('endUserPassword', '');
      Cypress.env('endUserId', '');
    });
  }
});
