/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';

const violationUrl = '/governance/violation';
const violationEndUserUrl = '/governance/user/violation';

/**
 * Get a list of violations
 * @param {Object} params query parameters
 * @param {Object} targetFilter filter to apply to query
 * @returns {Promise}
 */
export function getViolationList(params, targetFilter) {
  return generateIgaApi().post(`${violationUrl}/search${encodeQueryString(params)}`, { targetFilter });
}

/**
 * Get a single violation by id
 * @param {String} violationId id of violation to get
 * @returns {Promise}
 */
export function getViolation(violationId) {
  return generateIgaApi().get(`${violationUrl}/${violationId}`);
}

/**
 * Get a list of violations for end user
 * @param {Object} params query parameters
 * @param {Object} targetFilter filter to apply to query
 * @returns {Promise}
 */
export function getViolationListEndUser(params, targetFilter) {
  return generateIgaApi().post(`${violationEndUserUrl}/search${encodeQueryString(params, false)}`, { targetFilter });
}

/**
 * Comment on a violation
 * @param {String} violationId id of violation to comment on
 * @param {String} phaseId current phase of violation
 * @param {String} comment comment string
 * @returns {Promise}
 */
export function commentViolation(violationId, phaseId, comment) {
  return generateIgaApi().post(`${violationUrl}/${violationId}/phases/${phaseId}/comment`, { comment });
}

/**
 * @param {String} violationId id of violation to forward
 * @param {String} phaseId current phase of violation
 * @param {String} actorId actor to forward to
 * @param {Object} permissions permissions to forward with
 * @param {String} comment comment related to forward
 * @returns {Promise}
 */
export function forwardViolation(violationId, phaseId, actorId, permissions, comment) {
  const updatedActors = [{
    id: actorId,
    permissions,
  }];
  return generateIgaApi().post(`${violationUrl}/${violationId}/phases/${phaseId}/reassign`, { updatedActors, comment });
}

/**
 * Allow an exception
 * @param {String} violationId id of violation to forward
 * @param {String} phaseId current phase of violation
 * @param {Object} payload useful information for the request
 * @returns {Promise}
 */
export function allowException(violationId, phaseId, payload) {
  const { comment, exceptionExpirationDate } = payload;
  const exceptionUrl = exceptionExpirationDate ? 'exception' : 'allow';
  const dataObject = exceptionExpirationDate
    ? {
      exceptionExpirationDate,
      comment,
    }
    : { comment };
  return generateIgaApi().post(`${violationUrl}/${violationId}/phases/${phaseId}/${exceptionUrl}`, dataObject);
}

/**
 * Revoke an exception
 * @param {Object} dataObject info of the request
 * @param {String[]} dataObject.ids ids to ve revoked
 * @param {String} dataObject.comment comment of the revokation
 * @returns {Promise}
 */
export function revokeException(dataObject) {
  return generateIgaApi().post(`${violationUrl}/cancel-exception`, dataObject);
}

/**
 * Remediate a violation
 * @param {String} violationId id of violation to remediate
 * @param {String} phaseId current phase of violation
 * @param {Object} payload data to be used in remediation
 * @returns {Promise}
 */
export function remediate(violationId, phaseId, payload) {
  return generateIgaApi().post(`${violationUrl}/${violationId}/phases/${phaseId}/remediate`, payload);
}
