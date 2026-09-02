/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  buildRelationshipSchemaBody,
  createRelationshipSchemaProperty,
  deleteSchemaProperty,
} from '@e2e/api/relationshipApi.e2e';

export default class RelationshipApiSteps {
  /**
   * Tracked relationships created during the run — both API-seeded and UI-created.
   * Each entry: { source, propertyName }
   * @type {Array}
   */
  static createdRelationships = [];

  /**
   * Records a relationship for afterEach cleanup without creating anything. Used to
   * track relationships the UI creates (intercepted schema PUTs).
   *
   * @param {string} source - Source managed object name.
   * @param {string} propertyName - Relationship property name.
   */
  static trackRelationship(source, propertyName) {
    const alreadyTracked = RelationshipApiSteps.createdRelationships.some(
      (entry) => entry.source === source && entry.propertyName === propertyName,
    );
    if (!alreadyTracked) {
      RelationshipApiSteps.createdRelationships.push({ source, propertyName });
    }
  }

  /**
   * Creates a relationship schema property on the source object and tracks it for cleanup.
   * The backend creates the reverse property on the target object automatically. Any
   * orphan of the same property name from an earlier crashed run is deleted first — a
   * stale entry makes the schema service reject the PUT with "Invalid relationship schema".
   *
   * @param {Object} options
   * @param {string} options.source - Source managed object name (e.g. 'alpha_role').
   * @param {string} options.propertyName - Source property name (custom_ prefixed for built-ins).
   * @param {string} options.target - Target managed object name.
   * @param {string} options.reversePropertyName - Property created on the target object.
   * @param {string} [options.label] - Source property display label.
   * @param {string} [options.description] - Source property description.
   * @param {boolean} [options.sourceIsMultivalued=false] - "Has many" source cardinality.
   * @param {boolean} [options.targetIsMultivalued=false] - "Has many" target cardinality.
   * @param {Array<string>} [options.sourceFields] - Source display properties.
   * @param {Array<string>} [options.targetFields] - Target display properties.
   * @returns {Cypress.Chainable}
   */
  static createRelationship({
    source,
    propertyName,
    target,
    reversePropertyName,
    label,
    description,
    sourceIsMultivalued = false,
    targetIsMultivalued = false,
    sourceFields = [],
    targetFields = [],
  }) {
    const body = buildRelationshipSchemaBody({
      targetObjectName: target,
      reversePropertyName,
      title: label,
      description,
      sourceIsMultivalued,
      targetIsMultivalued,
      sourceFields,
      targetFields,
    });
    return deleteSchemaProperty(source, propertyName, false).then(() => createRelationshipSchemaProperty(
      source,
      propertyName,
      body,
    ).then((response) => {
      expect(response.status).to.equal(201);
      RelationshipApiSteps.trackRelationship(source, propertyName);
      return response;
    }));
  }

  /**
   * Deletes all tracked relationship properties via the Schema API, which also removes
   * the reverse property on the target object. Failures are tolerated (404 for already
   * deleted, 500 when a custom object participates). The Schema API is the only supported
   * cleanup path — restoring relationships through `config/managed` de-syncs the schema
   * service and breaks subsequent schema writes.
   *
   * @returns {Cypress.Chainable}
   */
  static deleteCreatedRelationships() {
    const entries = [...RelationshipApiSteps.createdRelationships];
    RelationshipApiSteps.createdRelationships = [];
    if (!entries.length) return cy.wrap(null);
    return cy.wrap(entries).each(({ source, propertyName }) => (
      deleteSchemaProperty(source, propertyName, false)
    ));
  }

  /**
   * Intercepts the schema-PUT the wizard sends when saving a relationship, so that
   * UI-created relationships are captured for cleanup. Call before the wizard is opened.
   */
  static interceptUICreation() {
    cy.intercept('PUT', 'openidm/schema/managed/**/properties/**', (req) => {
      req.continue((res) => {
        if (res.statusCode === 201) {
          const match = req.url.match(/schema\/managed\/([^/]+)\/properties\/([^/?]+)/);
          if (match) {
            RelationshipApiSteps.trackRelationship(decodeURIComponent(match[1]), decodeURIComponent(match[2]));
          }
        }
      });
    }).as('uiCreateRelationship');
  }

  /**
   * Waits for the intercepted UI creation to complete and asserts its status.
   * Must be called after saveRelationship() in a test that called interceptUICreation().
   */
  static waitForUICreationAndTrack() {
    cy.wait('@uiCreateRelationship', { timeout: 30000 }).its('response.statusCode').should('eq', 201);
  }
}
