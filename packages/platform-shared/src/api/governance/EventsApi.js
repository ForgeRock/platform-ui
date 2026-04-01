/**
 * Copyright 2022 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  find,
  isEmpty,
  pick,
  reject,
} from 'lodash';
import { getConfig, putConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
// List of event types we are giving the platform-admin ui access to modify
const allowedEventTypes = [
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
 * The locally scoped saveEvent function is called by the public createOrUpdateEvent and deleteEvent
 * functions below to create, edit, or remove an event from managed config.
 * @param {Object} eventData the data for the event including the 'objectName' and 'event'.
 * @param {Boolean} deleteMe flag signifying removal of the event defined in eventData.
 */
const saveEvent = (eventData, deleteMe) => getConfig('managed').then(({ data }) => {
  const managedConfig = data;
  // Get a ref to the managed object.
  const object = find(managedConfig.objects, { name: eventData.objectName });
  if (deleteMe) {
    // Delete the ref's event
    delete object[eventData.event];
  } else {
    // Modify the ref's event based on eventData.event.
    object[eventData.event] = eventData.action;
  }
  // Put managedConfig back after having modified the referenced event;
  return putConfig('managed', managedConfig);
});
/**
 * Reads current managed config and compiles a list of all events currently defined
 * in the environment and a list of all events available for creation.
 *
 * @returns {Promise} a promise that resolves to an object containing an array of defined and available events.
 */
export function getEvents() {
  return getConfig('managed').then(({ data }) => {
    const defined = [];
    const available = [];
    // Loop over each managed object and add each of it's defined events to defined
    // and all of it's available events to available.
    data.objects.forEach((managedObject) => {
      // Find all of the managed object's defined events based on allowedEventTypes (defined above)
      const definedEventNames = Object.keys(pick(managedObject, allowedEventTypes));
      definedEventNames.forEach((eventName) => {
        const objectTitle = managedObject.schema.title;
        const action = managedObject[eventName];
        // If there is no action.globals add it.
        if (!action.globals || isEmpty(action.globals)) {
          action.globals = {};
        }
        // If there is no action.globals._humanReadableEventName_ add a default.
        action.globals._humanReadableEventName_ = action.globals._humanReadableEventName_ || `${objectTitle} (${eventName})`;
        // Add the event to the defined array.
        defined.push({
          objectName: managedObject.name,
          event: eventName,
          objectTitle,
          action,
        });
      });
      // Add available events for this object.
      available.push({
        objectName: managedObject.name,
        objectTitle: managedObject.schema.title,
        availableEvents: reject(allowedEventTypes, (eventName) => definedEventNames.includes(eventName)),
      });
    });

    return {
      defined,
      available,
    };
  });
}
/**
 * Deletes an event
 * @param {Object} eventData the data for the event including the 'objectName' and 'event'.
 */
export function deleteEvent(eventData) {
  return saveEvent(eventData, true);
}
/**
 * Creates a new event or edits an existing one
 * @param {Object} eventData the data for the event including the 'objectName' and 'event'.
 */
export function createOrUpdateEvent(eventData) {
  return saveEvent(eventData);
}
