/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { createIDMResource, deleteIDMResource } from '@e2e/api/managedApi.e2e';

export default class AssignmentApiSteps {
  static createdAssignmentIds = [];

  static get assignmentResourceName() {
    return Cypress.env('IS_FRAAS') ? 'alpha_assignment' : 'assignment';
  }

  /** Create a managed assignment via API and track its id for cleanup. */
  static createAssignment(name, mappingName, description = '') {
    const body = {
      name,
      description: description || `${name} description`,
      mapping: mappingName,
    };
    return createIDMResource('managed', AssignmentApiSteps.assignmentResourceName, body).then((response) => {
      expect(response.status).to.equal(201);
      AssignmentApiSteps.createdAssignmentIds.push(response.body._id);
      return response;
    });
  }

  /** Delete all assignments created during the test run. */
  static deleteCreatedAssignments() {
    return cy.wrap(AssignmentApiSteps.createdAssignmentIds).then((ids) => {
      if (!ids.length) return null;
      return cy.wrap(ids).each((id) => (
        deleteIDMResource('managed', AssignmentApiSteps.assignmentResourceName, id, undefined, false)
      )).then(() => {
        AssignmentApiSteps.createdAssignmentIds = [];
      });
    });
  }
}
