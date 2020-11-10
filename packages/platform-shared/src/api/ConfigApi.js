/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { generateIdmApi } from './BaseApi';

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

/**
 * Puts config file into config store
 *
 * @returns {Promise} API promise with result from config put
 */
export function putConfig(file, config) {
  return generateIdmApi().put(`config/${file}`, config);
}

/**
 * Deletes config file from config store
 *
 * @returns {Promise} API promise with result from config delete
 */
export function deleteConfig(file) {
  return generateIdmApi().delete(`config/${file}`);
}
