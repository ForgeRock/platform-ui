/**
 * Copyright 2025-2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  deleteSessionService,
  createSessionService,
  getSessionService,
} from '@e2e/api/amConsoleServicesApi.e2e';

function getWith403Retry() {
  return getSessionService().then((getResponse) => {
    if (getResponse.status !== 403) {
      return getResponse;
    }
    // ACCESS_TOKEN degraded mid-run (getAccessToken-cascade family) — refresh and retry once
    return cy.loginAsAdminCachedForCucumber().then(() => getSessionService());
  });
}

function recreateOriginalService() {
  const original = amSessionServiceState.originalSessionService; // eslint-disable-line no-use-before-define
  if (!original || !original.dynamic) {
    // No service existed before the run (nightly 404 baseline) — nothing to recreate
    return cy.wrap(null);
  }
  // Re-create from the snapshot body's full dynamic section so properties other
  // than the four the test mutates are not reset to AM defaults
  return createSessionService({ dynamic: original.dynamic });
}

/**
 * Holds the tenant's pre-test session service body so a feature-scoped `after` hook
 * can restore it. The session service step deletes and recreates the session service,
 * which would otherwise leave Maximum Idle Time/Maximum Session Time mutated on the
 * tenant after the run and poison every later suite that logs a user in.
 */
export const amSessionServiceState = {
  originalSessionService: null,
  givenInvoked: false,
  snapshotOriginalSessionService() {
    return getWith403Retry().then((getResponse) => {
      if (getResponse.status === 200) {
        amSessionServiceState.originalSessionService = getResponse.body;
      }
    });
  },
  restoreOriginalSessionService() {
    if (!amSessionServiceState.givenInvoked) {
      // The step never ran in this feature — nothing was created or mutated, so nothing to restore
      return cy.wrap(null);
    }
    amSessionServiceState.givenInvoked = false;
    return getWith403Retry().then((getResponse) => {
      if (getResponse.status === 200) {
        // The test-created service is present — remove it so the original can be recreated
        return deleteSessionService({ ...getResponse.body, _rev: undefined })
          .then(() => recreateOriginalService())
          .then((result) => {
            amSessionServiceState.originalSessionService = null;
            return result;
          });
      }
      // Service already absent (e.g. 404) — recreate the original
      return recreateOriginalService().then((result) => {
        amSessionServiceState.originalSessionService = null;
        return result;
      });
    });
  },
};
