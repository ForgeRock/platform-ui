/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  createRealmService,
  deleteRealmService,
  getRealmService,
} from '@e2e/api/realmServicesApi.e2e';

const withoutVolatileFields = (body) => {
  const copy = { ...body };
  delete copy._rev;
  delete copy._id;
  return copy;
};

export default class RealmServicesApiSteps {
  static savedServiceConfigs = {};

  static mutatedServiceIds = new Set();

  /**
   * Captures a service's current config (or its absence) for restore. Only the
   * first capture per service wins: on retries an earlier attempt may already
   * have mutated the service, and re-reading would record that as the original.
   */
  static saveServiceConfig(realmName, serviceId) {
    const saved = RealmServicesApiSteps.savedServiceConfigs[realmName] || {};
    if (serviceId in saved) {
      return null;
    }
    return getRealmService(realmName, serviceId).then((response) => {
      RealmServicesApiSteps.savedServiceConfigs[realmName] = {
        ...saved,
        [serviceId]: response.status === 200 ? { ...response.body } : null,
      };
      return response.status === 200;
    });
  }

  static getService(realmName, serviceId) {
    return getRealmService(realmName, serviceId);
  }

  /**
   * Marks a service as mutated by the test; only mutated services are restored.
   */
  static markServiceMutated(realmName, serviceId) {
    RealmServicesApiSteps.mutatedServiceIds.add(`${realmName}/${serviceId}`);
  }

  /**
   * Restores captured services to their as-found state. Untouched services are
   * left alone; mutated ones are deleted, recreated, or reconfigured to match
   * the captured state.
   */
  static restoreSavedServiceConfigs() {
    const entries = Object.entries(RealmServicesApiSteps.savedServiceConfigs)
      .flatMap(([realmName, services]) => Object.entries(services).map(([serviceId, savedConfig]) => [realmName, serviceId, savedConfig]));
    const mutated = RealmServicesApiSteps.mutatedServiceIds;
    RealmServicesApiSteps.savedServiceConfigs = {};
    RealmServicesApiSteps.mutatedServiceIds = new Set();
    if (!entries.length) return undefined;
    // Chain restores with .then — cy.wrap of a promise containing cy.* commands
    // is a Cypress error.
    return entries
      .reduce(
        (chain, [realmName, serviceId, savedConfig]) => chain.then(() => {
          if (!mutated.has(`${realmName}/${serviceId}`)) return undefined;
          return RealmServicesApiSteps.restoreService(realmName, serviceId, savedConfig);
        }),
        cy.wrap(entries, { log: false }),
      );
  }

  static restoreService(realmName, serviceId, savedConfig) {
    return getRealmService(realmName, serviceId).then((current) => {
      if (savedConfig === null) {
        // Did not exist before; remove whatever the test left.
        if (current.status === 200) return deleteRealmService(realmName, serviceId);
        return null;
      }
      const originalConfig = withoutVolatileFields(savedConfig);
      if (current.status !== 200) {
        // Existed before; the test removed it. Recreate.
        return createRealmService(realmName, serviceId, originalConfig);
      }
      if (JSON.stringify(withoutVolatileFields(current.body)) === JSON.stringify(originalConfig)) {
        return null;
      }
      return deleteRealmService(realmName, serviceId).then(() => createRealmService(realmName, serviceId, originalConfig));
    });
  }
}
