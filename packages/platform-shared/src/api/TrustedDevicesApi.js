/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAmApi } from './BaseApi';

/**
 * Load Trusted Devices for a user
 *
 * @param {string} realm - Realm for the request
 * @param {string} userSearchAttribute - User id for the request
 * @returns {Promise<object>} List of user's trusted devices
 */
export function loadUserTrustedDevices(realm, userSearchAttribute) {
  return generateAmApi({
    apiVersion: 'protocol=2.1,resource=1.0',
    path: `realms/root/realms/${realm}`,
  }).get(
    `/users/${userSearchAttribute}/devices/profile?_queryFilter=true`,
    { withCredentials: true },
  );
}

/**
 * Update Trusted Device
 *
 * @param {string} realm - Realm for the request
 * @param {string} userSearchAttribute - User id for the request
 * @param {object} payload - Updated data as JSON
 * @param {string} id - id of the trusted device
 * @returns {Promise<object>} AM Device item
 */
export function updateTrustedDevice(realm, userSearchAttribute, payload, id) {
  return generateAmApi({
    apiVersion: 'protocol=2.1,resource=1.0',
    path: `realms/root/realms/${realm}`,
  }).put(
    `/users/${userSearchAttribute}/devices/profile/${id}`,
    payload,
    { withCredentials: true },
  );
}

/**
 * Delete Trusted Device
 *
 * @param {string} realm - Realm for the request
 * @param {string} userSearchAttribute - User id for the request
 * @param {string} id - id of the trusted device
 * @returns {Promise<object>} AM Device item
 */
export function deleteTrustedDevice(realm, userSearchAttribute, id) {
  return generateAmApi({
    apiVersion: 'protocol=2.1,resource=1.0',
    path: `realms/root/realms/${realm}`,
  }).delete(
    `/users/${userSearchAttribute}/devices/profile/${id}`,
    { withCredentials: true },
  );
}
