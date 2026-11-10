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
  patchIDMConfig,
  putIDMResource,
} from '@e2e/api/managedApi.e2e';

// Cleanup also collects leftovers from interrupted runs of this spec.
const requiredPropertyPattern = /^e2eRequiredProp\d+$/;

export default class ManagedObjectApiSteps {
  static createdUserIds = [];

  static createdCustomManagedObjectNames = [];

  static addedRequiredUserProperties = [];

  static get userResourceName() {
    return Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
  }

  static get userPropertyPrefix() {
    return Cypress.env('IS_FRAAS') ? 'custom_' : '';
  }

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

  /** Intercepts the UI create-resource POST for the managed user resource. */
  static interceptUIUserCreation() {
    const resourceName = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    cy.intercept('POST', `/openidm/managed/${resourceName}?_action=create`).as('createUserUI');
  }

  /** Waits for the UI user-creation intercept and tracks the new user id for cleanup. */
  static waitForUIUserCreationAndTrack() {
    cy.wait('@createUserUI').then(({ response }) => {
      expect(response, 'user creation request received a response').to.be.an('object');
      expect(response.statusCode).to.equal(201);
      ManagedObjectApiSteps.createdUserIds.push(response.body._id);
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
   * Tracks a managed object type that was created through the UI (not via
   * createCustomManagedObject) so deleteCreatedCustomManagedObjects() removes it too.
   *
   * @param {string} name - Internal IDM name of the UI-created object type.
   */
  static trackCustomManagedObject(name) {
    ManagedObjectApiSteps.createdCustomManagedObjectNames.push(name);
  }

  /**
   * Reads the managed configuration to locate the user object. Only targeted
   * JSON Patch operations write the schema, never this full document.
   * @param {boolean} tolerant return null with a log instead of failing during cleanup
   * @returns {Cypress.Chainable<{objects: Object[], objectIndex: number}|null>}
   */
  static getUserObjectConfig(tolerant = false) {
    return getIDMResource('config', 'managed', undefined, !tolerant).then((response) => {
      if (response.status !== 200) {
        cy.log(`getUserObjectConfig: read config/managed returned HTTP ${response.status}`);
        return null;
      }
      const { objects } = response.body;
      const objectIndex = objects.findIndex(({ name }) => name === ManagedObjectApiSteps.userResourceName);
      if (tolerant && objectIndex < 0) {
        cy.log(`getUserObjectConfig: user object ${ManagedObjectApiSteps.userResourceName} not found`);
        return null;
      }
      expect(objectIndex, `user object ${ManagedObjectApiSteps.userResourceName} in config/managed`).to.be.at.least(0);
      return { objects, objectIndex };
    });
  }

  /**
   * Adds a required custom property via JSON Patch: replacing config/managed
   * wholesale exceeds the cloud request-size limit. The property is tracked
   * before the write so a failed attempt can still clean it up.
   *
   * @param {string} propertyName base property name (e.g. 'e2eRequiredProp123')
   * @returns {Cypress.Chainable<string>} the stored property name, which
   *   carries the `custom_` prefix in FRAAS
   */
  static addRequiredUserProperty(propertyName) {
    const fullPropertyName = `${ManagedObjectApiSteps.userPropertyPrefix}${propertyName}`;
    ManagedObjectApiSteps.addedRequiredUserProperties.push(fullPropertyName);
    return ManagedObjectApiSteps.getUserObjectConfig().then(({ objects, objectIndex }) => {
      const { schema } = objects[objectIndex];
      const patch = [
        {
          operation: 'add',
          field: `objects/${objectIndex}/schema/properties/${fullPropertyName}`,
          value: {
            type: 'string',
            title: propertyName,
            description: `E2E required property ${propertyName}`,
            // All three keys are property-wizard parity — omitting any fails
            // journey start with 401 "Login failure"
            viewable: true,
            userEditable: true,
            searchable: false,
          },
        },
      ];
      ['required', 'order'].forEach((schemaField) => {
        const current = schema[schemaField] || [];
        if (!current.includes(fullPropertyName)) {
          // The ForgeRock JSON Patch operator rejects array indices and "/-",
          // so arrays are replaced with their complete new value.
          patch.push({
            operation: 'replace',
            field: `objects/${objectIndex}/schema/${schemaField}`,
            value: [...current, fullPropertyName],
          });
        }
      });
      return patchIDMConfig('managed', patch).then((response) => {
        expect(response.status, 'JSON Patch add required property').to.equal(200);
        return fullPropertyName;
      });
    });
  }

  /**
   * Removes properties added by this spec and any matching leftovers from an
   * interrupted run. Cleanup failures are logged without aborting other cleanup.
   * @returns {Cypress.Chainable}
   */
  static removeRequiredUserProperties() {
    return ManagedObjectApiSteps.getUserObjectConfig(true).then((config) => {
      if (!config) return null;
      const { objects, objectIndex } = config;
      const { schema } = objects[objectIndex];
      const properties = Object.keys(schema.properties || {})
        .filter((name) => requiredPropertyPattern.test(name.replace(/^custom_/, '')));
      const namesToRemove = [...new Set([
        ...ManagedObjectApiSteps.addedRequiredUserProperties,
        ...properties,
      ])];
      if (!namesToRemove.length) return null;
      const patch = namesToRemove.map((propertyName) => ({
        operation: 'remove',
        field: `objects/${objectIndex}/schema/properties/${propertyName}`,
      }));
      ['required', 'order'].forEach((schemaField) => {
        const current = schema[schemaField] || [];
        const next = current.filter((name) => !namesToRemove.includes(name));
        if (next.length !== current.length) {
          // The ForgeRock JSON Patch operator rejects array indices and "/-".
          patch.push({
            operation: 'replace',
            field: `objects/${objectIndex}/schema/${schemaField}`,
            value: next,
          });
        }
      });
      return patchIDMConfig('managed', patch, false).then((response) => {
        if (response.status >= 400) {
          cy.log(`removeRequiredUserProperties: returned HTTP ${response.status}`);
        } else {
          ManagedObjectApiSteps.addedRequiredUserProperties = [];
        }
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
