/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { createIDMResource, deleteIDMResource } from '@e2e/api/managedApi.e2e';
import ApplicationApiSteps from '@e2e/steps/api/ApplicationApiSteps';

export default class RoleApiSteps {
  static createdRoleIds = [];

  static get roleResourceName() {
    return Cypress.env('IS_FRAAS') ? 'alpha_role' : 'role';
  }

  /** Create a managed role via API and track its id for cleanup. */
  static createRole(roleName, description = '') {
    const body = {
      name: roleName,
      description: description || `${roleName} description`,
    };
    return createIDMResource('managed', RoleApiSteps.roleResourceName, body).then((response) => {
      expect(response.status).to.equal(201);
      RoleApiSteps.createdRoleIds.push(response.body._id);
      return response;
    });
  }

  /** Set up an intercept for UI-triggered role creation. */
  static interceptUIRoleCreation() {
    cy.intercept('POST', `/openidm/managed/${RoleApiSteps.roleResourceName}?_action=create`).as('createRole');
  }

  /** Wait for the intercepted creation request and track the resulting role id. */
  static waitForUIRoleCreationAndTrack() {
    cy.wait('@createRole').then(({ response }) => {
      expect(response.statusCode).to.equal(201);
      RoleApiSteps.createdRoleIds.push(response.body._id);
    });
  }

  /** Assign an application to a managed role via API (PATCH /openidm/managed/{role}/{roleId}). */
  static assignApplicationToRole(roleId, applicationId) {
    return cy.request({
      method: 'PATCH',
      url: `https://${Cypress.env('FQDN')}/openidm/managed/${RoleApiSteps.roleResourceName}/${roleId}`,
      headers: {
        authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
        'content-type': 'application/json',
      },
      body: [{
        field: '/applications/-',
        operation: 'add',
        value: {
          _ref: `managed/${ApplicationApiSteps.applicationResourceName}/${applicationId}`,
          _refProperties: {},
        },
      }],
    });
  }

  /** Delete all roles created during the test run. */
  static deleteCreatedRoles() {
    return cy.wrap(RoleApiSteps.createdRoleIds).then((ids) => {
      if (!ids.length) return null;
      return cy.wrap(ids).each((id) => (
        deleteIDMResource('managed', RoleApiSteps.roleResourceName, id, undefined, false)
      )).then(() => {
        RoleApiSteps.createdRoleIds = [];
      });
    });
  }
}
