/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  buildScriptJob,
  createJob,
  deleteJob,
  getJobs,
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
   * Creates a job with a fully custom payload and tracks it for cleanup.
   *
   * @param {string} name - The job ID / name
   * @param {Object} data - Full job payload
   */
  static createJob(name, data) {
    return createJob(name, data).then((response) => {
      JobsApiSteps.createdJobNames.push(name);
      return response;
    });
  }

  static getJobs() {
    return getJobs();
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

  static trackJob(name) {
    if (!JobsApiSteps.createdJobNames.includes(name)) {
      JobsApiSteps.createdJobNames.push(name);
    }
  }
}
