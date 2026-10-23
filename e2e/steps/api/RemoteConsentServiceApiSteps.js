/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  createService,
  deleteService,
  getService,
  getServiceSchema,
  putService,
} from '@e2e/api/servicesApi.e2e';

const SERVICE_ID = 'RemoteConsentService';
const METADATA_KEYS = ['_id', '_meta', '_rev', '_type'];

function stripMetadata(service) {
  const config = { ...service };
  METADATA_KEYS.forEach((key) => delete config[key]);
  return config;
}

export default class RemoteConsentServiceApiSteps {
  static originalService = null;

  static serviceExisted = false;

  static backupTaken = false;

  static backupService() {
    return cy.then(() => {
      if (RemoteConsentServiceApiSteps.backupTaken) return null;

      return getService(SERVICE_ID, { failOnStatusCode: false }).then((response) => {
        expect(response.status).to.satisfy((status) => status === 200 || status === 404,
          `Expected the RemoteConsentService GET to return 200 or 404, got ${response.status}. `
          + 'Refusing to overwrite an unknown service state.');
        RemoteConsentServiceApiSteps.backupTaken = true;
        RemoteConsentServiceApiSteps.serviceExisted = response.status === 200;
        RemoteConsentServiceApiSteps.originalService = response.status === 200 ? response.body : null;
        return null;
      });
    });
  }

  static deleteService(options = {}) {
    return deleteService(SERVICE_ID, options);
  }

  static getService(options = {}) {
    return getService(SERVICE_ID, options);
  }

  static getServiceSchema(options = {}) {
    return getServiceSchema(SERVICE_ID, options);
  }

  static restoreService() {
    return cy.then(() => {
      if (!RemoteConsentServiceApiSteps.backupTaken) return null;

      const finishRestore = () => {
        RemoteConsentServiceApiSteps.originalService = null;
        RemoteConsentServiceApiSteps.serviceExisted = false;
        RemoteConsentServiceApiSteps.backupTaken = false;
        return null;
      };

      if (!RemoteConsentServiceApiSteps.serviceExisted) {
        return deleteService(SERVICE_ID, { failOnStatusCode: false }).then((response) => {
          expect(response.status).to.be.oneOf([200, 204, 404]);
          return finishRestore();
        });
      }

      return getService(SERVICE_ID, { failOnStatusCode: false }).then((current) => {
        if (current.status !== 200) {
          return createService(SERVICE_ID, stripMetadata(RemoteConsentServiceApiSteps.originalService))
            .then((response) => {
              expect(response.status).to.be.oneOf([200, 201]);
              return finishRestore();
            });
        }

        return putService(SERVICE_ID, RemoteConsentServiceApiSteps.originalService)
          .then((response) => {
            expect(response.status).to.be.oneOf([200, 201]);
            return finishRestore();
          });
      });
    });
  }
}
