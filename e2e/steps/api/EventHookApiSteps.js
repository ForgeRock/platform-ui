/**
 * Copyright 2026 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  getManagedConfig,
  createEventHook,
  deleteAllEventHooks,
  deleteEventHook,
  ALLOWED_EVENT_TYPES,
} from '@e2e/api/eventHooksApi.e2e';
import CustomEndpointApiSteps from '@e2e/steps/api/CustomEndpointApiSteps';
import JourneyApiSteps from '@e2e/steps/api/JourneyApiSteps';

export default class EventHookApiSteps {
  static createdEventHooks = [];

  static createEventHook(params) {
    return createEventHook(params).then(({ response, originalValue }) => {
      const tracked = EventHookApiSteps.createdEventHooks.find(
        (hook) => hook.objectName === params.objectName && hook.event === params.event,
      );
      if (tracked) {
        // The pre-test tenant state was captured on the first create; a re-create
        // (e.g. beforeEach retry after a failed cleanup) must not record our own
        // hook as the value to restore.
        tracked.originalValue = tracked.originalValue ?? originalValue;
      } else {
        EventHookApiSteps.createdEventHooks.push({ objectName: params.objectName, event: params.event, originalValue });
      }
      return response;
    });
  }

  /**
   * Removes a hook left behind by a previously crashed run of a spec, identified by a
   * marker substring in its script source, so a fresh create captures the true tenant
   * state as originalValue instead of the stale hook itself.
   */
  static removeStaleHook(objectName, event, sourceMarker) {
    return getManagedConfig().then(({ body }) => {
      const managedObject = body.objects.find((obj) => obj.name === objectName);
      const isOurs = managedObject?.[event]?.source?.includes(sourceMarker);
      return isOurs ? deleteEventHook({ objectName, event }) : null;
    });
  }

  /**
   * Creates 11 event hooks across 4 managed objects, enough to exceed the default page size of 10.
   * Hook names follow the pattern Automated-Page-NN for easy identification.
   */
  static createPaginationEventHooks() {
    const prefix = Cypress.env('IS_FRAAS') ? 'alpha_' : '';
    const hooks = [
      { objectName: `${prefix}role`, event: 'onCreate' },
      { objectName: `${prefix}role`, event: 'onDelete' },
      { objectName: `${prefix}role`, event: 'onUpdate' },
      { objectName: `${prefix}user`, event: 'onCreate' },
      { objectName: `${prefix}user`, event: 'onDelete' },
      { objectName: `${prefix}user`, event: 'onUpdate' },
      { objectName: `${prefix}assignment`, event: 'onCreate' },
      { objectName: `${prefix}assignment`, event: 'onDelete' },
      { objectName: `${prefix}assignment`, event: 'onUpdate' },
      { objectName: `${prefix}organization`, event: 'onCreate' },
      { objectName: `${prefix}organization`, event: 'onDelete' },
    ];
    hooks.forEach(({ objectName, event }, i) => {
      EventHookApiSteps.createEventHook({
        objectName,
        event,
        name: `Automated-Page-${String(i + 1).padStart(2, '0')}`,
        source: "logger.info('pagination');",
      });
    });
  }

  /**
   * Seeds the custom-endpoint journey registration scenario: self-heals a stale hook,
   * creates the countries endpoint, installs the onValidate hook calling it, and
   * imports the dedicated registration journey. One call from the spec's beforeEach.
   * @param {Object} scenario - The scenario parameters
   * @param {string} scenario.endpointName - Name of the custom endpoint to create
   * @param {string} scenario.endpointSource - JavaScript source of the endpoint
   * @param {string} scenario.hookName - Human-readable name of the onValidate hook
   * @param {string} scenario.hookSource - JavaScript source of the onValidate hook
   * @param {Object} scenario.journey - JOURNEYS entry of the registration journey to import
   */
  static setupCountryValidationEndpoint({
    endpointName, endpointSource, hookName, hookSource, journey,
  }) {
    const objectName = Cypress.env('IS_FRAAS') ? 'alpha_user' : 'user';
    return cy.wrap(null).then(() => EventHookApiSteps.removeStaleHook(objectName, 'onValidate', `endpoint/${endpointName}`))
      .then(() => CustomEndpointApiSteps.createEndpoint(endpointName, endpointSource))
      .then(() => EventHookApiSteps.createEventHook({
        objectName,
        event: 'onValidate',
        name: hookName,
        source: hookSource,
      }))
      .then(() => JourneyApiSteps.importJourney(journey));
  }

  static deleteCreatedEventHooks() {
    return cy.wrap(null).then(() => {
      const hooks = [...EventHookApiSteps.createdEventHooks];
      if (!hooks.length) return null;

      return deleteAllEventHooks(hooks).then((response) => {
        if (response.isOkStatusCode) {
          EventHookApiSteps.createdEventHooks = [];
          return response;
        }
        throw new Error(`Failed to delete created event hooks — tenant may be in a dirty state. Status: ${response.status}`);
      });
    });
  }

  /**
   * Intercepts PUT requests to the managed config endpoint (used when saving event hooks via the UI)
   * and automatically tracks newly created hooks for cleanup.
   * Exposes the intercept as the '@saveEventHookUI' alias for use with cy.wait().
   */
  static interceptUICreation() {
    getManagedConfig().then(({ body: currentConfig }) => {
      const existingKeys = new Set(
        currentConfig.objects.flatMap((obj) => ALLOWED_EVENT_TYPES.filter((et) => obj[et]).map((et) => `${obj.name}::${et}`)),
      );

      cy.intercept('PUT', '**/openidm/config/managed*', (req) => {
        req.continue((res) => {
          if (res.statusCode === 200) {
            req.body.objects.forEach((obj) => {
              ALLOWED_EVENT_TYPES.filter((et) => obj[et]).forEach((et) => {
                const key = `${obj.name}::${et}`;
                if (!existingKeys.has(key)) {
                  EventHookApiSteps.createdEventHooks.push({ objectName: obj.name, event: et });
                  existingKeys.add(key);
                }
              });
            });
          }
        });
      }).as('saveEventHookUI');
    });
  }
}
