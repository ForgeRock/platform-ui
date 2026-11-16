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

const SERVICE_ID = 'IdentityAssertionService';
const SUB_TYPE = '/serverConfigs';
const METADATA_KEYS = ['_id', '_meta', '_rev', '_type'];

/** Single source of truth for assertion server field defaults shared by the API and UI steps. */
export const DEFAULT_SERVER_FIELDS = {
  serverUrl: 'https://assertion-server.e2e.example.com',
  jwtExpiration: 3600,
  skewAllowance: 60,
  secretLabelIdentifier: 'e2e.secret.label',
};

function stripMetadata(config) {
  const copy = { ...config };
  METADATA_KEYS.forEach((key) => delete copy[key]);
  return copy;
}

/**
 * Lists the service's secondary configurations via `_action=nextdescendents`.
 */
function listServers() {
  return getService(SERVICE_ID, {
    subresource: SUB_TYPE,
    method: 'POST',
    qs: { _action: 'nextdescendents' },
    failOnStatusCode: false,
  });
}

export default class AssertionServersApiSteps {
  static createdServerIds = [];

  static originalService = null;

  static originalServers = [];

  static serviceExisted = false;

  static backupComplete = false;

  static backupService() {
    return cy.then(() => getService(SERVICE_ID, { failOnStatusCode: false }).then((response) => {
      expect(response.status).to.satisfy((status) => status === 200 || status === 404,
        `Expected the IdentityAssertionService GET to return 200 or 404, got ${response.status}. `
        + 'Refusing to overwrite an unknown service state.');
      AssertionServersApiSteps.serviceExisted = response.status === 200;
      AssertionServersApiSteps.originalService = response.status === 200 ? response.body : null;
      return null;
    }).then(() => {
      if (!AssertionServersApiSteps.serviceExisted) {
        AssertionServersApiSteps.originalServers = [];
        AssertionServersApiSteps.backupComplete = true;
        return null;
      }
      return listServers().then((response) => {
        expect(response.status, 'Failed to list existing assertion servers for backup').to.eq(200);
        AssertionServersApiSteps.originalServers = response.body?.result || [];
        AssertionServersApiSteps.backupComplete = true;
        return null;
      });
    }));
  }

  /**
   * Deletes the IdentityAssertionService entirely (including its serverConfigs) so
   * the tests start from the not-enabled empty state.
   */
  static deleteService(options = {}) {
    return deleteService(SERVICE_ID, options);
  }

  /**
   * Captures the `_id` of any assertion server created through the UI, so cleanup
   * can remove servers the tests made outside the `createServer` API step.
   */
  static interceptUICreation() {
    cy.intercept('POST', '**/serverConfigs?_action=create', (request) => {
      request.continue((response) => {
        if (response.statusCode >= 200 && response.statusCode < 300 && response.body?._id) {
          AssertionServersApiSteps.createdServerIds.push(response.body._id);
        }
      });
    }).as('createServerConfigUI');
  }

  /** Deletes servers created via `createServer`, restores the service and any pre-existing servers. */
  static cleanup() {
    return cy.then(() => {
      const deleteCreatedServers = () => cy.wrap(AssertionServersApiSteps.createdServerIds, { log: false }).each((id) => {
        deleteService(SERVICE_ID, { subresource: `${SUB_TYPE}/${encodeURIComponent(id)}`, failOnStatusCode: false });
      }).then(() => {
        AssertionServersApiSteps.createdServerIds = [];
      });

      const finish = () => {
        AssertionServersApiSteps.backupComplete = false;
        AssertionServersApiSteps.serviceExisted = false;
        AssertionServersApiSteps.originalService = null;
        AssertionServersApiSteps.originalServers = [];
        return null;
      };

      // Only touch the service itself when the backup confirmed it was originally absent.
      // An incomplete backup must never trigger a delete of a service we did not verify.
      if (AssertionServersApiSteps.backupComplete && !AssertionServersApiSteps.serviceExisted) {
        return deleteService(SERVICE_ID, { failOnStatusCode: false }).then(() => deleteCreatedServers()).then(finish);
      }

      if (!AssertionServersApiSteps.backupComplete) {
        return deleteCreatedServers().then(finish);
      }

      // Service existed before the run: restore its config from the backup, then
      // recreate the pre-existing serverConfigs that the beforeEach deletion wiped.
      return getService(SERVICE_ID, { failOnStatusCode: false }).then((current) => {
        let restore;
        if (current.status !== 200) {
          restore = createService(SERVICE_ID, stripMetadata(AssertionServersApiSteps.originalService))
            .then((response) => {
              expect(response.status, 'Failed to recreate the backed-up IdentityAssertionService').to.be.oneOf([200, 201]);
              return response;
            });
        } else {
          restore = putService(SERVICE_ID, AssertionServersApiSteps.originalService);
        }
        return restore
          .then(() => cy.wrap(AssertionServersApiSteps.originalServers, { log: false }).each((server) => {
            createService(SERVICE_ID, stripMetadata(server), { subresource: SUB_TYPE, failOnStatusCode: false });
          }))
          .then(() => deleteCreatedServers())
          .then(finish);
      });
    });
  }
}
