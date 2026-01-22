/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { Given } from '@badeball/cypress-cucumber-preprocessor';
import { deleteIDMUser } from '@e2e/api/managedApi.e2e';
import { getValidTogoDestinations, putValidTogoDestinations } from '@e2e/api/amConsoleServicesApi.e2e';

this.definedValidGotoDestinations = [];

Given('user sets Validation Service with valid goto URL {string} on AM console via API', (validGoToDestinationURL) => {
  if (!this.definedValidGotoDestinations.includes(validGoToDestinationURL)) {
    if (!Cypress.env('ACCESS_TOKEN')) {
      cy.loginAsAdminCachedForCucumber();
    }
    getValidTogoDestinations().then((response) => {
      response.body.validGotoDestinations.push(validGoToDestinationURL);
      putValidTogoDestinations(response.body).then((requestResponse) => {
        expect(requestResponse.status).to.equal(200);
      });
    });
    this.definedValidGotoDestinations.push(validGoToDestinationURL);
  }
});

after(() => {
  if (Cypress.spec.relative.includes('go-to-url-validator-service.feature')) {
    if (!Cypress.env('ACCESS_TOKEN')) {
      cy.loginAsAdminCachedForCucumber();
    }
    cy.log('Reset original Valid GoTo URLs via API').then(() => {
      getValidTogoDestinations().then((response) => {
        const originalData = response.body.validGotoDestinations.filter((UrlDestination) => !this.definedValidGotoDestinations.includes(UrlDestination));
        response.body.validGotoDestinations = originalData;
        putValidTogoDestinations(response.body).then((requestResponse) => {
          expect(requestResponse.status).to.equal(200);
        });
      });
    });
    cy.log(`Deleting created IDM Enduser ${Cypress.env('endUserName')} via API`).then(() => {
      deleteIDMUser(Cypress.env('endUserId'));
      Cypress.env('endUserName', '');
      Cypress.env('endUserFirstName', '');
      Cypress.env('endUserLastName', '');
      Cypress.env('endUserPassword', '');
      Cypress.env('endUserId', '');
    });
  }
});
