/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { createIDMResource, deleteIDMResource } from '@e2e/api/managedApi.e2e';

function getUserResourceName() {
  return Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
}

export default class OrganizationApiSteps {
  static createdOrgIds = [];

  static get orgResourceName() {
    return Cypress.env('IS_FRAAS') ? 'alpha_organization' : 'organization';
  }

  /** Create a managed organization via API and track its id for cleanup. */
  static createOrganization(orgName, description = '') {
    const body = {
      name: orgName,
      description: description || `${orgName} description`,
    };
    return createIDMResource('managed', OrganizationApiSteps.orgResourceName, body).then((response) => {
      expect(response.status).to.equal(201);
      OrganizationApiSteps.createdOrgIds.push(response.body._id);
      return response;
    });
  }

  /**
   * Patch an organization via API.
   * Uses createIDMResource's base-URL conventions — proxied through the same FQDN env var.
   */
  static patchOrganization(id, patch) {
    return cy.request({
      method: 'PATCH',
      url: `https://${Cypress.env('FQDN')}/openidm/managed/${OrganizationApiSteps.orgResourceName}/${id}`,
      headers: {
        authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
        'content-type': 'application/json',
      },
      body: patch,
    });
  }

  /** Add one or more administrators to an organization via API. */
  static addAdministrators(orgId, userIds) {
    const patch = userIds.map((userId) => ({
      operation: 'add',
      field: '/admins/-',
      value: {
        _ref: `managed/${getUserResourceName()}/${userId}`,
        _refProperties: {},
      },
    }));
    return OrganizationApiSteps.patchOrganization(orgId, patch);
  }

  /** Add one or more owners to an organization via API. */
  static addOwners(orgId, userIds) {
    const patch = userIds.map((userId) => ({
      operation: 'add',
      field: '/owners/-',
      value: {
        _ref: `managed/${getUserResourceName()}/${userId}`,
        _refProperties: {},
      },
    }));
    return OrganizationApiSteps.patchOrganization(orgId, patch);
  }

  /** Intercept the IDM POST that creates an organization via the UI. */
  static interceptUIOrganizationCreation() {
    cy.intercept('POST', `/openidm/managed/${OrganizationApiSteps.orgResourceName}?_action=create`).as('createOrganization');
  }

  /** Wait for the creation intercept and track the new org id for cleanup. */
  static waitForUICreationAndTrack() {
    cy.wait('@createOrganization').then(({ response }) => {
      expect(response.statusCode).to.equal(201);
      OrganizationApiSteps.createdOrgIds.push(response.body._id);
    });
  }

  /** Delete all organizations created during the test run. */
  static deleteCreatedOrganizations() {
    return cy.wrap(OrganizationApiSteps.createdOrgIds).then((ids) => {
      if (!ids.length) return null;
      return cy.wrap(ids).each((id) => (
        deleteIDMResource('managed', OrganizationApiSteps.orgResourceName, id, undefined, false)
      )).then(() => {
        OrganizationApiSteps.createdOrgIds = [];
      });
    });
  }
}
