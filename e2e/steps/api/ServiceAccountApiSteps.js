/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  createServiceAccount, deleteServiceAccount, getServiceAccounts,
} from '@e2e/api/serviceAccountApi.e2e';

export default class ServiceAccountApiSteps {
  static createdServiceAccountIds = [];

  static interceptUICreation() {
    cy.intercept('POST', '**/managed/svcacct?_action=create', (req) => {
      req.continue((res) => {
        if (res.statusCode === 201 && res.body._id) {
          ServiceAccountApiSteps.createdServiceAccountIds.push(res.body._id);
        }
      });
    }).as('createServiceAccountUI');
  }

  static getServiceAccounts() {
    return getServiceAccounts();
  }

  static createServiceAccount(serviceAccountData) {
    return createServiceAccount(serviceAccountData).then((response) => {
      ServiceAccountApiSteps.createdServiceAccountIds.push(response.body._id);
      return response;
    });
  }

  static deleteCreatedServiceAccounts() {
    return cy.wrap(ServiceAccountApiSteps.createdServiceAccountIds).then((ids) => {
      if (!ids.length) return null;

      return cy.wrap(ids).each((id) => deleteServiceAccount(id, undefined, { failOnStatusCode: false })).then(() => {
        ServiceAccountApiSteps.createdServiceAccountIds = [];
      });
    });
  }
}
