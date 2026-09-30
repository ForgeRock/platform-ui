/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { deleteService, getService } from '@e2e/api/servicesApi.e2e';

export default class AuthenticationMethodsApiSteps {
  static createdServices = [];

  static getService(serviceId, options = {}) {
    return getService(serviceId, options);
  }

  static deleteService(serviceId, options = {}) {
    return deleteService(serviceId, options);
  }

  static interceptServiceCreation(serviceId, alias) {
    cy.intercept('POST', `**/services/${serviceId}?_action=create`, (request) => {
      request.continue((response) => {
        if (response.statusCode >= 200 && response.statusCode < 300
          && !AuthenticationMethodsApiSteps.createdServices.includes(serviceId)) {
          AuthenticationMethodsApiSteps.createdServices.push(serviceId);
        }
      });
    }).as(alias);
  }

  static forgetCreatedService(serviceId) {
    AuthenticationMethodsApiSteps.createdServices = AuthenticationMethodsApiSteps.createdServices
      .filter((createdServiceId) => createdServiceId !== serviceId);
  }

  static deleteCreatedServices() {
    return cy.wrap(AuthenticationMethodsApiSteps.createdServices).each((serviceId) => deleteService(serviceId, {
      failOnStatusCode: false,
    }).then((response) => {
      if (![200, 204, 404].includes(response.status)) {
        cy.task('log', `WARN: Failed to delete ${serviceId} during cleanup (status ${response.status})`);
      }
    })).then(() => {
      AuthenticationMethodsApiSteps.createdServices = [];
    });
  }
}
