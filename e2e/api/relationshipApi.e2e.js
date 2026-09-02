/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

export const idmUrl = (path) => `https://${Cypress.env('FQDN')}/openidm/${path}`;

export const authHeaders = () => ({
  authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
  'content-type': 'application/json',
});

/**
 * Creates a relationship schema property on a managed object.
 * Mirrors the payload the Configure > Relationships wizard sends via SchemaApi.saveSchemaProperty.
 * If the property defines `reverseRelationship`/`reversePropertyName`, the backend also creates
 * the reverse property on the target object.
 *
 * @param {string} sourceObjectName - Managed object that owns the property (e.g. 'alpha_role').
 * @param {string} propertyName - Name of the relationship property (custom_ prefixed for built-in objects).
 * @param {Object} body - Relationship schema property definition.
 * @returns {Cypress.Chainable}
 */
export function createRelationshipSchemaProperty(sourceObjectName, propertyName, body) {
  return cy.request({
    method: 'PUT',
    url: `${idmUrl(`schema/managed/${sourceObjectName}/properties/${propertyName}`)}?waitForCompletion=true`,
    headers: {
      ...authHeaders(),
      'accept-api-version': 'resource=2.0',
    },
    body,
  });
}

/**
 * Deletes a relationship schema property via the schema service. The backend removes the
 * reverse property on the target object as well. Only reliable when neither side of the
 * relationship is a custom managed object (returns 500 when a custom object is involved).
 *
 * @param {string} objectName - Managed object that owns the property.
 * @param {string} propertyName - Relationship property to delete.
 * @param {boolean} failOnStatusCode
 * @returns {Cypress.Chainable}
 */
export function deleteSchemaProperty(objectName, propertyName, failOnStatusCode = true) {
  return cy.request({
    method: 'DELETE',
    url: idmUrl(`schema/managed/${objectName}/properties/${propertyName}`),
    headers: {
      authorization: `Bearer ${Cypress.env('ACCESS_TOKEN').access_token}`,
    },
    failOnStatusCode,
  });
}

/**
 * Builds the relationship schema property payload the wizard sends for a "Has one"
 * source cardinality, matching relationshipSchemaUtils.js.
 *
 * @param {Object} options
 * @param {string} options.targetObjectName - Internal target object name (e.g. 'alpha_user').
 * @param {string} options.reversePropertyName - Property created on the target object.
 * @param {string} [options.title] - Display label of the source property.
 * @param {string} [options.description] - Source property description.
 * @param {Array<string>} [options.sourceFields] - Display properties of the source side.
 * @param {Array<string>} [options.targetFields] - Display properties of the target side.
 * @param {boolean} [options.validate=true] - Validate Relationship setting.
 * @param {boolean} [options.sourceIsMultivalued=false] - "Has many" on the source side.
 * @param {boolean} [options.targetIsMultivalued=false] - "Has many" on the target side.
 * @returns {Object} Payload for createRelationshipSchemaProperty.
 */
export function buildRelationshipSchemaBody({
  targetObjectName,
  reversePropertyName,
  title,
  description,
  sourceFields = [],
  targetFields = [],
  validate = true,
  sourceIsMultivalued = false,
  targetIsMultivalued = false,
}) {
  const resourceCollectionPartial = (fields) => ({
    notify: false,
    query: {
      queryFilter: 'true',
      fields,
    },
  });

  const refProperties = {
    type: 'relationship',
    reverseRelationship: true,
    reversePropertyName,
    validate,
    properties: {
      _ref: { type: 'string' },
      _refProperties: {
        type: 'object',
        properties: {
          _id: { type: 'string', required: false, propName: '_id' },
        },
      },
    },
    notifySelf: false,
  };

  const resourceCollection = {
    resourceCollection: [{
      path: `managed/${targetObjectName}`,
      label: targetObjectName,
      ...resourceCollectionPartial(sourceFields),
      reverseProperty: {
        type: targetIsMultivalued ? 'array' : 'relationship',
        validate: false,
        resourceCollection: resourceCollectionPartial(targetFields),
      },
    }],
  };

  return {
    description,
    title,
    viewable: true,
    searchable: false,
    userEditable: false,
    returnByDefault: false,
    required: false,
    type: sourceIsMultivalued ? 'array' : 'relationship',
    ...(sourceIsMultivalued
      ? { items: { ...refProperties, ...resourceCollection } }
      : { ...refProperties, ...resourceCollection }),
  };
}
