/**
 * Copyright 2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const eventUrl = '/governance/event';

/**
 * Create a new governance event
 * @param {object} event event to create
 * @returns The response is a promise that resolves to the created event.
 */
export function createEvent(event) {
  const params = { _action: 'create' };
  return generateIgaApi().post(`${eventUrl}${encodeQueryString(params)}`, event);
}

/**
 * Put event
 * @param {object} eventId id of the event to modify
 * @param {object} updatedEvent new event
 * @returns The response is a promise that resolves to the new event.
 */
export function putEvent(eventId, updatedEvent) {
  return generateIgaApi().put(`${eventUrl}/${eventId}`, updatedEvent);
}

/**
 * Get a governance event by id
 * @param {string} eventId id of event to get
 * @returns The response is a promise that resolves to the event.
 */
export function getEvent(eventId) {
  return generateIgaApi().get(`${eventUrl}/${eventId}`);
}

/**
 * Get list of governance events
 * @param {object} params query parameters passed to the backend
 * @returns The response is a promise that resolves to the data (including list of events) returned by the API.
 */
export function getEventList(params = { _pageSize: 10 }) {
  return generateIgaApi().get(`${eventUrl}${encodeQueryString(params)}`);
}

/**
 * Get list of governance event filter properties
 * @param {String} resourceName resource name to obtain properties for
 * @returns The response is a promise that resolves to the data (including list of resource properties) returned by the API.
 */
export function getFilterProperties(resourceName = 'user') {
  return generateIgaApi().get(`${eventUrl}/entity/${resourceName}`);
}

/**
 * Delete an event
 * @param {string} id event id to delete
 */
export function deleteEvent(eventId) {
  return generateIgaApi().delete(`${eventUrl}/${eventId}`);
}

/**
 * update event
 * @param {object} eventId id of the event to modify
 * @param {object} updatedEvent properties to be updated on the event
 */
export function updateEvent(eventId, updatedEvent) {
  return generateIgaApi().patch(`${eventUrl}/${eventId}`, updatedEvent);
}
