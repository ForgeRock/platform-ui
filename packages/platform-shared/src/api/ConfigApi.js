/**
 * Copyright (c) 2019-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import encodeQueryString from '@forgerock/platform-shared/src/utils/encodeQueryString';
import { generateAmApi, generateIdmApi } from './BaseApi';
import store from '@/store';

/**
  * Returns UI configuration file and additionally includes the server configured language
  *
  * @returns {Promise}
  */
export function getUiConfig() {
  return generateIdmApi().get('/info/uiconfig');
}

/**
 * Retrieves a config file from the config store
 *
 * @returns {Promise} API promise with return config file
 */
export function getConfig(file) {
  return generateIdmApi().get(`config/${file}`);
}

export function getAMConfig(file) {
  const path = `realms/root/realms/${store.state.realm}/realm-config`;
  const apiVersion = 'protocol=2.1,resource=1.1';
  return generateAmApi({ path }, { apiVersion }).get(`/${file}`);
}

/**
 * Puts config file into config store
 *
 * @returns {Promise} API promise with result from config put
 */
export function putConfig(file, config) {
  return generateIdmApi().put(`config/${file}`, config);
}

/**
 * Patches config file from config store
 *
 * @returns {Promise} API promise with result from config patch
 */
export function patchConfig(file, patch) {
  return generateIdmApi().patch(`config/${file}`, patch);
}

/**
 * Deletes config file from config store
 *
 * @returns {Promise} API promise with result from config delete
 */
export function deleteConfig(file) {
  return generateIdmApi().delete(`config/${file}`);
}

/**
 * Gets config results based on specific params
 *
 * @returns {Promise} API promise with return list of config files
 */
export function queryConfig(params) {
  return generateIdmApi().get(`config${encodeQueryString(params)}`);
}
