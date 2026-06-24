/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  buildScriptJob,
  buildSlowScriptJob,
  buildFullReconJob,
  createJob,
  deleteJob,
} from '@e2e/api/jobsApi.e2e';

export default class JobsApiSteps {
  static createdJobNames = [];

  /**
   * Creates a script job and tracks it for cleanup.
   *
   * @param {string} name - The job ID / name
   * @param {Object} overrides - Optional payload overrides
   */
  static createScriptJob(name, overrides = {}) {
    return createJob(name, buildScriptJob(name, overrides)).then((response) => {
      JobsApiSteps.createdJobNames.push(name);
      return response;
    });
  }

  /**
   * Creates a script job that sleeps for 20 seconds, keeping it in Running state long enough to assert on.
   *
   * @param {string} name - The job ID / name
   */
  static createSlowScriptJob(name) {
    return createJob(name, buildSlowScriptJob(name)).then((response) => {
      JobsApiSteps.createdJobNames.push(name);
      return response;
    });
  }

  /**
   * Creates a full reconciliation job and tracks it for cleanup.
   *
   * @param {string} name - The job ID / name
   * @param {Object} overrides - Optional payload overrides
   */
  static createFullReconJob(name, overrides = {}) {
    return createJob(name, buildFullReconJob(name, overrides)).then((response) => {
      JobsApiSteps.createdJobNames.push(name);
      return response;
    });
  }

  /**
   * Deletes all jobs created during the test run.
   */
  static deleteCreatedJobs() {
    return cy.wrap(null).then(() => {
      const names = [...JobsApiSteps.createdJobNames];
      if (!names.length) return null;

      names.forEach((name) => {
        deleteJob(name, undefined, { failOnStatusCode: false });
      });
      JobsApiSteps.createdJobNames = [];
      return null;
    });
  }

  static interceptSaveSchedule() {
    cy.intercept('PUT', '**/config/schedule/**').as('saveSchedule');
  }

  static waitForSaveSchedule() {
    cy.wait('@saveSchedule', { timeout: 10000 });
  }

  static interceptRunJob() {
    cy.intercept('POST', '**/scheduler/job/**').as('runJob');
  }

  static waitForRunJob() {
    cy.wait('@runJob');
  }

  static interceptDeleteSchedule() {
    cy.intercept('DELETE', '**/config/schedule/**').as('deleteSchedule');
  }

  static waitForDeleteSchedule() {
    cy.wait('@deleteSchedule', { timeout: 10000 });
  }

  static trackJob(name) {
    if (!JobsApiSteps.createdJobNames.includes(name)) {
      JobsApiSteps.createdJobNames.push(name);
    }
  }
}
