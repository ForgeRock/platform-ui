/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { createEndpoint, deleteEndpoint } from '@e2e/api/endpointsApi.e2e';

export default class CustomEndpointApiSteps {
  static createdEndpointNames = [];

  static createEndpoint(name) {
    if (!CustomEndpointApiSteps.createdEndpointNames.includes(name)) {
      CustomEndpointApiSteps.createdEndpointNames.push(name);
    }
    return createEndpoint(name);
  }

  static deleteCreatedEndpoints() {
    return cy.wrap(CustomEndpointApiSteps.createdEndpointNames).then((names) => {
      if (!names.length) return null;

      return cy.wrap(names).each((name) => deleteEndpoint(name)).then(() => {
        CustomEndpointApiSteps.createdEndpointNames = [];
      });
    });
  }
}
