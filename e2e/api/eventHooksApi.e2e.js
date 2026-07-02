/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

const MANAGED_CONFIG_URL = () => `https://${Cypress.env('FQDN')}/openidm/config/managed`;

/**
 * Event types that can have hooks attached, matching EventsApi.js in platform-shared.
 * Exported so steps can reference them without duplicating the list.
 */
export const ALLOWED_EVENT_TYPES = [
  'onCreate',
  'postCreate',
  'onRead',
  'onUpdate',
  'postUpdate',
  'onDelete',
  'postDelete',
  'onValidate',
  'onRetrieve',
  'onStore',
  'onSync',
];

/**
 * Reads the full managed objects configuration
 * @param {string} accessToken - Access token for the API call
 * @returns {Cypress.Chainable} Cypress request promise
 */
export function getManagedConfig(accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return cy.request({
    method: 'GET',
    url: MANAGED_CONFIG_URL(),
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    retryOnStatusCodeFailure: true,
  });
}

/**
 * Creates an event hook on a managed object by modifying the managed config
 * @param {Object} hookData - The event hook data
 * @param {string} hookData.objectName - The managed object name (e.g. 'alpha_user')
 * @param {string} hookData.event - The event type key (e.g. 'onUpdate')
 * @param {string} hookData.name - Human-readable hook name shown in the grid
 * @param {string} [hookData.source] - Optional script source
 * @param {string} accessToken - Access token for the API call
 * @returns {Cypress.Chainable} Cypress request promise
 */
export function createEventHook({
  objectName, event, name, source = '',
}, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return getManagedConfig(accessToken).then(({ body }) => {
    const config = body;
    const managedObject = config.objects.find((obj) => obj.name === objectName);
    const originalValue = managedObject[event];

    managedObject[event] = {
      type: 'text/javascript',
      source,
      globals: { _humanReadableEventName_: name },
    };

    return cy.request({
      method: 'PUT',
      url: `${MANAGED_CONFIG_URL()}?waitForCompletion=true`,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: config,
      retryOnStatusCodeFailure: true,
    }).then((response) => ({ response, originalValue }));
  });
}

/**
 * Deletes multiple event hooks from managed config in a single GET → modify → PUT cycle,
 * avoiding the race condition that occurs when doing separate GET/PUT pairs per hook.
 * @param {Array<{objectName: string, event: string}>} hooks - The hooks to remove
 * @param {string} accessToken - Access token for the API call
 * @returns {Cypress.Chainable} Cypress request promise
 */
export function deleteAllEventHooks(hooks, accessToken = Cypress.env('ACCESS_TOKEN').access_token) {
  return getManagedConfig(accessToken).then(({ body }) => {
    const config = body;
    hooks.forEach(({ objectName, event, originalValue }) => {
      const managedObject = config.objects.find((obj) => obj.name === objectName);
      if (!managedObject) return;
      if (originalValue !== undefined) {
        managedObject[event] = originalValue;
      } else {
        delete managedObject[event];
      }
    });
    return cy.request({
      method: 'PUT',
      url: `${MANAGED_CONFIG_URL()}?waitForCompletion=true`,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: config,
      failOnStatusCode: false,
    });
  });
}

/**
 * Deletes an event hook from a managed object by modifying the managed config
 * @param {Object} hookData - Identifies the hook to remove
 * @param {string} hookData.objectName - The managed object name (e.g. 'alpha_user')
 * @param {string} hookData.event - The event type key to remove (e.g. 'onUpdate')
 * @param {string} accessToken - Access token for the API call
 * @param {Object} options - Additional cy.request options (e.g. { failOnStatusCode: false })
 * @returns {Cypress.Chainable} Cypress request promise
 */
export function deleteEventHook({ objectName, event }, accessToken = Cypress.env('ACCESS_TOKEN').access_token, options = {}) {
  return getManagedConfig(accessToken).then(({ body }) => {
    const config = body;
    const managedObject = config.objects.find((obj) => obj.name === objectName);

    if (managedObject && managedObject[event]) {
      delete managedObject[event];
    }

    return cy.request({
      method: 'PUT',
      url: `${MANAGED_CONFIG_URL()}?waitForCompletion=true`,
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: config,
      ...options,
    });
  });
}
