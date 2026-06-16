/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const SCHEDULE_URL = (name) => `https://${Cypress.env('FQDN')}/openidm/config/schedule/${name}?waitForCompletion=true`;
const SCHEDULER_JOB_URL = `https://${Cypress.env('FQDN')}/openidm/scheduler/job`;

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
    type: 'simple',
    ...overrides,
  };
}

/**
 * Lists all user-defined persisted scheduled jobs.
 *
 * @param {string} accessToken
 */
export function getJobs(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  const queryFilter = encodeURIComponent(
    "persisted eq true and (schedule pr or type eq 'simple') and !(invokeContext/script/source co 'roles/onSync-roles') and !(invokeContext/script/source co 'triggerSyncCheck')",
  );
  return cy.request({
    method: 'GET',
    url: `${SCHEDULER_JOB_URL}?_queryFilter=${queryFilter}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    retryOnStatusCodeFailure: true,
  });
}
