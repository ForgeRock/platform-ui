/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const SCHEDULE_URL = (name) => `https://${Cypress.env('FQDN')}/openidm/config/schedule/${name}?waitForCompletion=true`;

/**
 * Creates or updates a scheduled job.
 *
 * @param {string} name - The job ID / name
 * @param {Object} data - The job payload (follows SCRIPT_SAVE_OBJ / TASKSCANNER_SAVE_OBJ shape)
 * @param {string} accessToken
 */
export function createJob(name, data, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'PUT',
    url: SCHEDULE_URL(name),
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: data,
    retryOnStatusCodeFailure: true,
  });
}

/**
 * Deletes a scheduled job by name.
 *
 * @param {string} name - The job ID / name
 * @param {string} accessToken
 * @param {Object} options - Additional cy.request options (e.g. { failOnStatusCode: false })
 */
export function deleteJob(name, accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  return cy.request({
    method: 'DELETE',
    url: SCHEDULE_URL(name),
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    ...options,
  });
}

/**
 * Returns a minimal script job payload.
 * Runs every hour, enabled by default.
 *
 * @param {string} name - The job ID / name
 * @param {Object} overrides - Optional property overrides
 */
export function buildScriptJob(name, overrides = {}) {
  return {
    _id: name,
    concurrentExecution: false,
    enabled: true,
    endTime: null,
    invokeContext: {
      script: {
        globals: null,
        source: "logger.info('e2e test job');",
        type: 'text/javascript',
      },
    },
    invokeLogLevel: 'info',
    invokeService: 'script',
    misfirePolicy: 'fireAndProceed',
    persisted: true,
    recoverable: false,
    repeatCount: -1,
    repeatInterval: 3600000,
    startTime: null,
    triggers: [],
    type: 'simple',
    ...overrides,
  };
}

/**
 * Returns a script job payload whose script sleeps for 20 seconds,
 * keeping the job in Running state long enough to assert on.
 *
 * @param {string} name - The job ID / name
 * @param {Object} overrides - Optional property overrides
 */
export function buildSlowScriptJob(name, overrides = {}) {
  return buildScriptJob(name, {
    invokeContext: {
      script: {
        globals: null,
        source: 'java.lang.Thread.sleep(20000);',
        type: 'text/javascript',
      },
    },
    // Far-future startTime prevents the scheduler from auto-firing on creation,
    // so tests can assert the Running state by triggering "Run Now" explicitly.
    startTime: '2099-12-31T23:59:59Z',
    ...overrides,
  });
}

/**
 * Returns a minimal task scanner job payload.
 *
 * @param {string} name - The job ID / name
 * @param {Object} overrides - Optional property overrides
 */
export function buildTaskScannerJob(name, overrides = {}) {
  return {
    _id: name,
    concurrentExecution: false,
    enabled: true,
    endTime: null,
    invokeContext: {
      numberOfThreads: 5,
      scan: {
        _queryFilter: 'true',
        object: 'managed/user',
        taskState: {
          completed: '/taskCompleted',
          started: '/taskStarted',
        },
      },
      task: {
        script: {
          globals: {},
          source: "logger.info('e2e task scanner job');",
          type: 'text/javascript',
        },
        waitForCompletion: false,
      },
    },
    invokeLogLevel: 'info',
    invokeService: 'org.forgerock.openidm.taskscanner',
    misfirePolicy: 'fireAndProceed',
    persisted: true,
    recoverable: false,
    repeatCount: -1,
    repeatInterval: 3600000,
    startTime: null,
    triggers: [],
    type: 'simple',
    ...overrides,
  };
}

/**
 * Returns a minimal full reconciliation job payload.
 *
 * @param {string} name - The job ID / name
 * @param {Object} overrides - Optional property overrides
 */
export function buildFullReconJob(name, overrides = {}) {
  return {
    _id: name,
    concurrentExecution: false,
    enabled: true,
    endTime: null,
    invokeContext: {
      action: 'reconcile',
      mapping: 'systemLdap_managedUser',
    },
    invokeLogLevel: 'info',
    invokeService: 'org.forgerock.openidm.sync',
    misfirePolicy: 'fireAndProceed',
    persisted: true,
    recoverable: false,
    repeatCount: -1,
    repeatInterval: 3600000,
    startTime: '2099-12-31T23:59:59Z',
    triggers: [],
    type: 'simple',
    ...overrides,
  };
}

/**
 * Returns a minimal incremental reconciliation (liveSync) job payload.
 *
 * @param {string} name - The job ID / name
 * @param {Object} overrides - Optional property overrides
 */
export function buildIncrementalReconJob(name, overrides = {}) {
  return {
    _id: name,
    concurrentExecution: false,
    enabled: true,
    endTime: null,
    invokeContext: {
      action: 'liveSync',
      source: 'system/ldap/account',
    },
    invokeLogLevel: 'info',
    invokeService: 'org.forgerock.openidm.provisioner',
    misfirePolicy: 'fireAndProceed',
    persisted: true,
    recoverable: false,
    repeatCount: -1,
    repeatInterval: 3600000,
    startTime: '2099-12-31T23:59:59Z',
    triggers: [],
    type: 'simple',
    ...overrides,
  };
}
