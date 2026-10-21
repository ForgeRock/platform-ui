/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Then } from '@badeball/cypress-cucumber-preprocessor';
import { deleteIDMUser } from '@e2e/api/managedApi.e2e';
import fetchSessionInfo from '@e2e/api/sessionApi.e2e';
import getTimeDifferenceInMinutes from '@e2e/utils/timeUtils';
import { amSessionServiceState } from '@e2e/api/amSessionServiceState.e2e';

before(() => {
  if (Cypress.spec.relative.includes('logout-warning-before-exp')) {
    if (!Cypress.env('ACCESS_TOKEN')) {
      cy.loginAsAdminCachedForCucumber();
    }
    cy.log('Snapshotting original AM session service (Maximum Idle Time etc.) via API')
      .then(() => amSessionServiceState.snapshotOriginalSessionService());
  }
});

after(() => {
  if (Cypress.spec.relative.includes('logout-warning-before-exp')) {
    if (!Cypress.env('ACCESS_TOKEN')) {
      cy.loginAsAdminCachedForCucumber();
    }
    // Chain the IDM user deletion off the restore so an aborted restore cannot leave the user behind
    cy.log('Restoring original AM session service (Maximum Idle Time etc.) via API')
      .then(() => amSessionServiceState.restoreOriginalSessionService())
      .then(() => {
        cy.log(`Deleting created IDM end user ${Cypress.env('endUserName')} via API`);
        return deleteIDMUser(Cypress.env('endUserId'));
      })
      .then(() => {
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
