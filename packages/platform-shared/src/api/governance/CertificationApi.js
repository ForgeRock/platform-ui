/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIgaApi } from '../BaseApi';

const governanceBaseUrl = '/governance';
const governanceCertificationBaseUrl = `${governanceBaseUrl}/certification`;
const governanceCertificationAdminBaseUrl = `${governanceBaseUrl}/admin/certification`;

export function getAdminCertificationItems(params = {}) {
  const defaultParams = {
    status: 'active',
    pageNumber: 0,
    pageSize: 10,
  };
  if (!params.queryString) {
    delete params.queryString;
  }
  return generateIgaApi().get('/governance/admin/certification', { params: { ...defaultParams, ...params } });
}

/**
 * Get certification items
 */
export function getCertificationItems(params = {}) {
  const defaultParams = {
    status: 'active',
    pageNumber: 0,
    pageSize: 10,
  };
  return generateIgaApi().get('governance/certification/items', { params: { ...defaultParams, ...params } });
}

export function activateCertification(campaignId) {
  // TODO: no staged available in API
  return generateIgaApi().post(`/governance/certification/${campaignId}/activate`);
}

export function cancelCertification(campaignId) {
  return generateIgaApi().post(`/governance/certification/${campaignId}/cancel`);
}

export function updateCertificationDeadline(campaignId, newDeadline) {
  return generateIgaApi().post(`/governance/certification/${campaignId}/update-deadline`, { newDeadline });
}

export function deleteCertification(campaignId) {
  return generateIgaApi().delete(`/governance/certification/${campaignId}`);
}

/**
 * Take forward action on certifications
 * @param {String} userId ID of reviewer user
 * @param {String} certId ID of the certification campaign
 * @param {String} newActorId ID to delegate the item to
 * @param {String} comment Comment to leave on delegate
 * @returns {Promise}
 */
export function forwardCertification(userId, certId, newActorId, comment) {
  const url = `${governanceCertificationBaseUrl}/${certId}/items/forward?selectAllActorId=${userId}`;
  return generateIgaApi().post(url, { newActorId, comment, ids: [] });
}

export function searchCertificates(searchTerm, params) {
  const defaultParams = {
    pageSize: 10,
    pageNumber: 0,
    sortBy: 'name',
  };

  return generateIgaApi().post('/governance/certification/template/search', {
    targetFilter: {
      operator: 'CONTAINS',
      operand: {
        targetName: 'name',
        targetValue: searchTerm,
      },
    },
  }, { params: { ...defaultParams, ...params } });
}

export function searchAllTemplateNames() {
  return generateIgaApi().get('/governance/certification/template?pageSize=10000&fields=name');
}

/**
* Returns the list of certification tasks
*
* @param {object} params - Optional parameters to be plugged into query string
* {
*   queryFilter: String,
*   sortBy: String,
*   pageSize: String,
* }
* @returns {Promise}
*/
export function getCertificationTasksListByCampaign(urlParams, campaign, payload) {
  const queryParams = new URLSearchParams(urlParams).toString();
  const resourceUrl = `${governanceCertificationBaseUrl}/${campaign}/items/search?${queryParams}`;
  return generateIgaApi().post(resourceUrl, payload);
}

export function getCertificationTaskAccountDetails(campaignId, itemId) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${campaignId}/items/${itemId}/account`;
  return generateIgaApi().get(resourceUrl);
}

export function getCertificationCountsByCampaign(campaign, actorId, isAdmin) {
  const params = {
    getCount: true,
    isAdmin,
    ...(isAdmin ? { primaryReviewerId: actorId } : { actorId }),
  };

  const queryParams = new URLSearchParams(params).toString();
  const resourceUrl = `${governanceCertificationBaseUrl}/${campaign}/items?${queryParams}`;
  return generateIgaApi().get(resourceUrl);
}
/**
* Returns in progress tasks
*
* @param {string} campaignId - id of the selected campaign
* @param {boolean} isAdmin - determine if the user is admin
* @returns {Promise}
*/
export function getInProgressTasksByCampaign(campaignId, isAdmin = false) {
  const queryParams = {
    status: 'in-progress',
    isAdmin,
  };
  const resourceUrl = `${governanceCertificationBaseUrl}/${campaignId}/items`;
  return generateIgaApi().get(resourceUrl, { params: queryParams });
}

/**
* Returns the certification details
*
* @param {object} params - Optional parameters to be plugged into query string
* campaignId
* @returns {Promise}
*/
export function getCertificationDetails(campaignId) {
  const resourceUrl = `${governanceCertificationAdminBaseUrl}/${campaignId}`;
  return generateIgaApi().get(resourceUrl);
}

/**
* Returns user info by certification line item
* @param {String} campaignId Id of the current campaign
* @param {String} lineItemId Id of line item
* @returns {Promise}
*/
export function getCertificationLineItemUser(campaignId, lineItemId) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${campaignId}/items/${lineItemId}/user`;
  return generateIgaApi().get(resourceUrl);
}

/**
* forward all certification tasks
*
* @param {object} certId - id of the certification
* campaignId
* @returns {Promise}
*/
export function forwardCertificationTasks(certId, payload) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${certId}/items/forward`;
  return generateIgaApi().post(resourceUrl, payload);
}

/**
* sifgOff all certification tasks if they are all completed
*
* @param {object} certId - id of the certification
* campaignId
* @returns {Promise}
*/
export function signOffCertificationTasks(certId, actorId) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${certId}/items/signoff`;
  return generateIgaApi().post(resourceUrl, {
    actorId,
    ids: [],
  });
}

/**
* certify certification tasks
*
* @param {object} certId - id of the certification
* campaignId
* @returns {Promise}
*/
export function certifyCertificationTasks(certId, lineItemsIds) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${certId}/items/certify`;
  return generateIgaApi().post(resourceUrl, lineItemsIds);
}

/**
* revoke certification tasks
*
* @param {object} certId - id of the certification
* campaignId
* @returns {Promise}
*/
export function revokeCertificationTasks(certId, lineItemsIds) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${certId}/items/revoke`;
  return generateIgaApi().post(resourceUrl, lineItemsIds);
}

/**
* exception certification tasks
*
* @param {object} certId - id of the certification
* campaignId
* @returns {Promise}
*/
export function exceptionCertificationTasks(certId, lineItemsIds) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${certId}/items/exception`;
  return generateIgaApi().post(resourceUrl, lineItemsIds);
}

/**
* reassign certification tasks
*
* @param {object} certId - id of the certification
* campaignId
* @returns {Promise}
*/
export function reassignCertificationTasks(certId, lineItemsIds) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${certId}/items/reassign`;
  return generateIgaApi().post(resourceUrl, lineItemsIds);
}

/**
* delegate certification tasks
*
* @param {object} certId - id of the certification
* campaignId
* @returns {Promise}
*/
export function delegateCertificationTasks(certId, lineItemsIds) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${certId}/items/delegate`;
  return generateIgaApi().post(resourceUrl, lineItemsIds);
}

/**
 * Returns single certification item by Id
 * @param {String} certId ID of the certification campaign
 * @param {String} lineItemId ID of the certification line item
 * @returns {Promise}
 */
export function getCertificationLineItem(certId, lineItemId) {
  const url = `${governanceCertificationBaseUrl}/${certId}/items/${lineItemId}`;
  return generateIgaApi().get(url);
}

/**
 * Take certify action on items
 * @param {String} certId ID of the certification campaign
 * @param {String} lineItemId ID of the certification line item
 * @returns {Promise}
 */
export function certifyLineItem(certId, lineItemId) {
  const url = `${governanceCertificationBaseUrl}/${certId}/items/${lineItemId}/certify`;
  return generateIgaApi().post(url);
}

export function resetLineItem(certId, lineItemId) {
  const url = `${governanceCertificationBaseUrl}/${certId}/items/${lineItemId}/reset`;
  return generateIgaApi().post(url);
}

/**
 * Take revoke action on items
 * @param {String} certId ID of the certification campaign
 * @param {String} lineItemId ID of the certification line item
 * @param {String} comment Comment to leave on revoke
 * @returns {Promise}
 */
export function revokeLineItem(certId, lineItemId, comment = '') {
  const url = `${governanceCertificationBaseUrl}/${certId}/items/${lineItemId}/revoke`;
  return generateIgaApi().post(url, { comment });
}

/**
 * Take exception action on items
 * @param {String} certId ID of the certification campaign
 * @param {String} lineItemId ID of the certification line item
 * @param {String} comment Comment to leave on exception
 * @returns {Promise}
 */
export function exceptionLineItem(certId, lineItemId, comment = '') {
  const url = `${governanceCertificationBaseUrl}/${certId}/items/${lineItemId}/exception`;
  return generateIgaApi().post(url, { comment });
}

/**
 * Reassign items to another ID
 * @param {String} certId ID of the certification campaign
 * @param {String} lineItemId ID of the certification line item
 * @param {String} newActorId ID to reassign the item to
 * @param {object} permissions - object with the permissions for the actor
 * @returns {Promise}
 */
export function reassignLineItem(certId, lineItemId, newActorId, permissions) {
  const url = `${governanceCertificationBaseUrl}/${certId}/items/${lineItemId}/reassign`;
  return generateIgaApi().post(url, { newActorId, permissions });
}

/**
 * Take forward action on items
 * @param {String} certId ID of the certification campaign
 * @param {String} lineItemId ID of the certification line item
 * @param {String} comment Comment to leave on delegate
 * @param {String} newActorId ID to delegate the item to
 * @returns {Promise}
 */
export function forwardLineItem(certId, lineItemId, comment = '', newActorId) {
  const url = `${governanceCertificationBaseUrl}/${certId}/items/${lineItemId}/forward`;
  return generateIgaApi().post(url, { comment, newActorId });
}

export function saveComment(certId, lineItemId, comment) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${certId}/items/${lineItemId}/comment`;
  return generateIgaApi().post(resourceUrl, { comment });
}

export function getCertificationUserFilter(certId, certifierId) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${certId}/items/filter/user?actorId=${certifierId}`;
  return generateIgaApi().get(resourceUrl);
}

export function getCertificationApplicationFilter(certId, certifierId) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${certId}/items/filter/application?actorId=${certifierId}`;
  return generateIgaApi().get(resourceUrl);
}

export function updateLineItemReviewers(itemId, actors) {
  const resourceUrl = `${governanceCertificationBaseUrl}/items/${itemId}/actors`;
  return generateIgaApi().put(resourceUrl, { actors });
}

/**
 * @description Obtains the entitlement details of a specific line item
 * @param {String} campaignId - ID of line item campaign
 * @param {String} itemId - ID of line item
 * @returns {Promise}
 */
export function getCertificationEntitlementDetails(campaignId, itemId) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${campaignId}/items/${itemId}/entitlement`;
  return generateIgaApi().get(resourceUrl);
}

/**
 * @description Obtains the entitlement details by user
 * @param {String} campaignId - ID of line item campaign
 * @param {String} itemId - ID of line item
 * @returns {Promise}
 */
export function getUserEntitlementsDetails(campaignId, itemId) {
  const resourceUrl = `${governanceCertificationBaseUrl}/${campaignId}/items/${itemId}/user/entitlements`;
  return generateIgaApi().get(resourceUrl);
}
