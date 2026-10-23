/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  deleteService,
  getService,
  putService,
} from '@e2e/api/servicesApi.e2e';

const SERVICE_ID = 'selfServiceTrees';

const METADATA_KEYS = ['_id', '_meta', '_rev', '_type'];

function stripMetadata(service) {
  const configuration = { ...service };
  METADATA_KEYS.forEach((key) => {
    delete configuration[key];
  });
  return configuration;
}

export default class SelfServiceJourneysApiSteps {
  static originalService = null;

  static serviceExisted = false;

  static backupTaken = false;

  static backupService() {
    return cy.then(() => {
      if (SelfServiceJourneysApiSteps.backupTaken) return null;

      return getService(SERVICE_ID, { failOnStatusCode: false }).then((response) => {
        expect(response.status).to.satisfy((status) => status === 200 || status === 404,
          `Expected the selfServiceTrees service GET to return 200 or 404, got ${response.status}. `
          + 'Refusing to overwrite an unknown service state.');
        SelfServiceJourneysApiSteps.backupTaken = true;
        SelfServiceJourneysApiSteps.serviceExisted = response.status === 200;
        SelfServiceJourneysApiSteps.originalService = response.status === 200 ? response.body : null;
        return null;
      });
    });
  }

  static resetService() {
    return cy.then(() => {
      if (!SelfServiceJourneysApiSteps.serviceExisted) return null;

      return putService(SERVICE_ID, { enabled: false, treeMapping: {} }, { failOnStatusCode: false }).then((response) => {
        expect(response.status).to.equal(200);
        return null;
      });
    });
  }

  static restoreService() {
    return cy.then(() => {
      if (!SelfServiceJourneysApiSteps.backupTaken) return null;

      const restoreRequest = SelfServiceJourneysApiSteps.serviceExisted
        ? putService(SERVICE_ID, stripMetadata(SelfServiceJourneysApiSteps.originalService), { failOnStatusCode: false })
        : deleteService(SERVICE_ID, { failOnStatusCode: false });

      return restoreRequest.then((response) => {
        expect(response.status).to.be.oneOf([200, 204, 404]);
        SelfServiceJourneysApiSteps.originalService = null;
        SelfServiceJourneysApiSteps.serviceExisted = false;
        SelfServiceJourneysApiSteps.backupTaken = false;
        return null;
      });
    });
  }
}
