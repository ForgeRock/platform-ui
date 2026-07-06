/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { random } from 'lodash';
import {
  createIDMUser,
  deleteIDMUser,
  getIDMResource,
  putIDMResource,
} from '@e2e/api/managedApi.e2e';

export default class ManagedObjectApiSteps {
  static createdUserIds = [];

  static createdCustomManagedObjectNames = [];

  /**
   * Creates a managed user with a randomised userName, stores the ID for later cleanup,
   * and exposes `testUserName` via Cypress.env so tests can reference the created user.
   *
   * @returns {Cypress.Chainable<{ userId: string }>}
   */
  static createUser() {
    const userName = `e2eTestUser${random(Number.MAX_SAFE_INTEGER)}`;
    return createIDMUser({ userName }).then((response) => {
      expect(response.status).to.equal(201);
      const userId = response.body._id;
      ManagedObjectApiSteps.createdUserIds.push(userId);
      Cypress.env('testUserName', userName);
      return { userId };
    });
  }

  /**
   * Deletes all users created during the current test run via createUser().
   *
   * @returns {Cypress.Chainable}
   */
  static deleteCreatedUsers() {
    return cy.wrap(ManagedObjectApiSteps.createdUserIds).then((ids) => {
      if (!ids.length) return null;
      return cy.wrap(ids).each((id) => deleteIDMUser(id, false)).then(() => {
        ManagedObjectApiSteps.createdUserIds = [];
      });
    });
  }

  /**
   * Appends a new custom managed object type to `config/managed` and tracks its name
   * for later cleanup by deleteCreatedCustomManagedObjects().
   *
   * @param {string} name - Internal IDM name (e.g. 'customTest1234').
   * @param {string} title - Display title shown in the UI (e.g. 'Test1234').
   * @returns {Cypress.Chainable}
   */
  static createCustomManagedObject(name, title) {
    return getIDMResource('config', 'managed').then((response) => {
      expect(response.status).to.equal(200);
      const objects = [...response.body.objects, {
        name,
        schema: {
          id: `urn:jsonschema:org:forgerock:openidm:managed:${name}`,
          title,
          type: 'object',
          properties: {},
        },
      }];
      return putIDMResource('config', 'managed', { objects }).then((putResponse) => {
        expect(putResponse.status).to.equal(200);
        ManagedObjectApiSteps.createdCustomManagedObjectNames.push(name);
      });
    });
  }

  /**
   * Removes all custom managed object types added during the test run by restoring
   * `config/managed` to the state before any of them were added.
   *
   * @returns {Cypress.Chainable}
   */
  static deleteCreatedCustomManagedObjects() {
    if (!ManagedObjectApiSteps.createdCustomManagedObjectNames.length) return cy.wrap(null);
    return getIDMResource('config', 'managed').then((response) => {
      expect(response.status).to.equal(200);
      const objects = response.body.objects.filter(
        (obj) => !ManagedObjectApiSteps.createdCustomManagedObjectNames.includes(obj.name),
      );
      return putIDMResource('config', 'managed', { objects }).then((putResponse) => {
        expect(putResponse.status).to.equal(200);
        ManagedObjectApiSteps.createdCustomManagedObjectNames = [];
      });
    });
  }

  /**
   * Polls the IDM managed endpoint for the given object name until it responds with a non-404
   * status, with retries to handle async config propagation.
   * Uses cy.request with failOnStatusCode: false so 404s don't fail the test.
   *
   * @param {string} objectName - Internal IDM name (e.g. 'customTest1234').
   */
  static waitForCustomObjectEndpoint(objectName) {
    const poll = (retries = 10) => {
      cy.request({
        method: 'GET',
        url: `https://${Cypress.env('FQDN')}/openidm/managed/${objectName}?_queryFilter=true&_pageSize=1`,
        headers: {
          authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
          'content-type': 'application/json',
        },
        failOnStatusCode: false,
      }).then((response) => {
        if (response.status === 404 && retries > 0) {
          // eslint-disable-next-line cypress/no-unnecessary-waiting
          cy.wait(1000);
          poll(retries - 1);
        }
      });
    };
    poll();
  }
}
