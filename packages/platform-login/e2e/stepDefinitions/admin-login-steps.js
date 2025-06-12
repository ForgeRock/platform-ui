/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { deleteIDMUser } from '@e2e/api/managedApi.e2e';

after(() => {
  if (Cypress.spec.relative.includes('admin-login.feature') && Cypress.env('endUserId')) {
    cy.loginAsAdmin();
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
