/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const roleMiningSessionUrl = '/governance/popRoleMining/sessions';
const userPropertiesUrl = '/governance/popRoleMining/userProperties';

/**
 * Query population-based role mining sessions.
 * @param {object} params query parameters passed to the backend (e.g. _pagedResultsOffset, _pageSize)
 * @returns The response is a promise that resolves to the data (including list of sessions) returned by the API.
 */
export function getRoleMiningSessionList(params = {}) {
  return generateIgaApi().get(`${roleMiningSessionUrl}${encodeQueryString(params, false)}`);
}

/**
 * Get a population-based role mining session by ID.
 * @param {string} sessionId id of the session to retrieve
 * @returns The response is a promise that resolves to the selected session, including its status.
 */
export function getRoleMiningSession(sessionId) {
  return generateIgaApi().get(`${roleMiningSessionUrl}/${sessionId}`);
}

/**
 * Create a new pending population-based role mining session.
 * @param {object} session the population filter and mining settings for the new session
 * @returns The response is a promise that resolves to the newly created session.
 */
export function createRoleMiningSession(session) {
  return generateIgaApi().post(roleMiningSessionUrl, session);
}

/**
 * Start the pipeline for a population-based role mining session. Asynchronous - the mining
 * engine runs as a background job and the caller should poll getRoleMiningSession for status.
 * @param {string} sessionId id of the session to run
 * @returns The response is a promise that resolves once the run has been accepted (HTTP 202).
 */
export function runRoleMiningSession(sessionId) {
  return generateIgaApi().post(`${roleMiningSessionUrl}/${sessionId}/run`);
}

/**
 * List roles produced by a population-based role mining session.
 * @param {string} sessionId id of the session whose roles to retrieve
 * @param {object} params query parameters passed to the backend (e.g. _pagedResultsOffset, _pageSize)
 * @returns The response is a promise that resolves to the list of roles produced by the session.
 */
export function getRoleMiningSessionRoles(sessionId, params = {}) {
  return generateIgaApi().get(`${roleMiningSessionUrl}/${sessionId}/roles${encodeQueryString(params, false)}`);
}

// NOTE: DELETE is not part of the documented endpoint list for this feature, but the epic
// (IGA-4931) and the session-card design both require deleting one's own sessions. The path
// follows REST convention - confirm with the backend team before this ships.
/**
 * Delete a population-based role mining session. Callers may only delete their own sessions.
 * @param {string} sessionId id of the session to delete
 */
export function deleteRoleMiningSession(sessionId) {
  return generateIgaApi().delete(`${roleMiningSessionUrl}/${sessionId}`);
}

/**
 * List identity attribute names usable as population filter criteria.
 * @returns The response is a promise that resolves to the list of user properties usable as filter criteria.
 */
export function getRoleMiningUserProperties() {
  return generateIgaApi().get(userPropertiesUrl);
}

/**
 * List distinct values for a user property.
 * @param {string} propertyId id of the user property
 * @param {object} params query parameters passed to the backend (e.g. _pageSize)
 * @returns The response is a promise that resolves to the list of distinct values for the property.
 */
export function getRoleMiningUserPropertyValues(propertyId, params = {}) {
  return generateIgaApi().get(`${userPropertiesUrl}/${propertyId}/values${encodeQueryString(params, false)}`);
}

/**
 * Preview the population matching a filterCriteria map before creating a session.
 * @param {object} body request body: { filterCriteria: { attribute: [values] }, page (1-based), pageSize (1-100) }
 * @returns The response is a promise that resolves to { total, page, pageSize, identities }.
 */
export function getPopulationPreview(body = {}) {
  return generateIgaApi().post('/governance/popRoleMining/preview', body);
}
