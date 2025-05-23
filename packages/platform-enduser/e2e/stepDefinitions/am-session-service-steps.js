/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Then } from '@badeball/cypress-cucumber-preprocessor';
import { deleteIDMUser } from '@e2e/api/managedApi.e2e';
import fetchSessionInfo from '@e2e/api/sessionApi.e2e';
import getTimeDifferenceInMinutes from '@e2e/utils/timeUtils';

after(() => {
  if (Cypress.spec.relative.includes('logout-warning-before-expirtaion-on-id-hosted-pages.feature')) {
    if (!Cypress.env('ACCESS_TOKEN')) {
      cy.loginAsAdmin();
    }
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

Then('maxIdleExpirationTime value is set correctly to {int} minute(s)', (minutes) => {
  fetchSessionInfo().then((response) => {
    const { maxIdleExpirationTime, latestAccessTime } = response.body;
    expect(getTimeDifferenceInMinutes(latestAccessTime, maxIdleExpirationTime)).to.equal(minutes);
  });
});
