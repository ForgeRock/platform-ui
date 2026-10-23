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
  putService,
} from '@e2e/api/servicesApi.e2e';
import { stripMetadata } from '@e2e/utils/serviceUtils';

export default class IdentityVerificationApiSteps {
  static originalService = null;

  static serviceExisted = false;

  static backupTaken = false;

  /**
   * Backs up the current state of a service so it can be restored after the tests run.
   * @param {string} serviceId - AM service identifier (e.g. 'JumioService').
   */
  static backupService(serviceId) {
    return cy.then(() => {
      if (IdentityVerificationApiSteps.backupTaken) return null;

      return getService(serviceId, { failOnStatusCode: false }).then((response) => {
        expect(response.status).to.satisfy((status) => status === 200 || status === 404,
          `Expected the ${serviceId} GET to return 200 or 404, got ${response.status}. `
          + 'Refusing to overwrite an unknown service state.');
        IdentityVerificationApiSteps.backupTaken = true;
        IdentityVerificationApiSteps.serviceExisted = response.status === 200;
        IdentityVerificationApiSteps.originalService = response.status === 200 ? response.body : null;
        return null;
      });
    });
  }

  static deleteService(serviceId, options = {}) {
    return deleteService(serviceId, options);
  }

  static getService(serviceId, options = {}) {
    return getService(serviceId, options);
  }

  /**
   * Deletes the service (asserting the result) and restores the backed-up state,
   * so the environment matches how it was before the tests ran.
   * @param {string} serviceId - AM service identifier (e.g. 'JumioService').
   */
  static restoreService(serviceId) {
    return cy.then(() => {
      if (!IdentityVerificationApiSteps.backupTaken) return null;

      const finishRestore = () => {
        IdentityVerificationApiSteps.originalService = null;
        IdentityVerificationApiSteps.serviceExisted = false;
        IdentityVerificationApiSteps.backupTaken = false;
        return null;
      };

      // The tests always leave the service deleted; asserting the delete catches
      // failures early instead of letting them surface as a confusing restore error.
      return deleteService(serviceId, { failOnStatusCode: false }).then((deleteResponse) => {
        expect(deleteResponse.status).to.be.oneOf([200, 204, 404]);

        if (!IdentityVerificationApiSteps.serviceExisted) {
          return finishRestore();
        }

        // Re-check current state so create-vs-put matches the live service state.
        return getService(serviceId, { failOnStatusCode: false }).then((current) => {
          if (current.status !== 200) {
            return createService(serviceId, stripMetadata(IdentityVerificationApiSteps.originalService))
              .then((response) => {
                expect(response.status).to.be.oneOf([200, 201]);
                return finishRestore();
              });
          }

          return putService(serviceId, stripMetadata(IdentityVerificationApiSteps.originalService))
            .then((response) => {
              expect(response.status).to.be.oneOf([200, 201]);
              return finishRestore();
            });
        });
      });
    });
  }
}
