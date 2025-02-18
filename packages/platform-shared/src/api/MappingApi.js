/**
 * Copyright (c) 2022-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '../utils/encodeQueryString';

export function getMappingDetails() {
  return generateIdmApi().get('/endpoint/mappingDetails');
}

/**
 * Pull full sync.json (not from memory)
 * @returns results of entire sync.json
 */
export function getSyncFile() {
  return generateIdmApi().get('config/sync');
}

/**
 * Pull sync mappings from IDM memory
 */
export function getSyncMappings(params) {
  const url = `sync/mappings${encodeQueryString(params)}`;

  return generateIdmApi().get(url);
}

/**
 * Pulls the specified mapping from individual mapping file. Returns 404 if not found.
 * @param {String} mappingName unique name of mapping
 */
export function getConfigMapping(mappingName) {
  const url = `config/mapping/${mappingName}`;

  return generateIdmApi().get(url);
}

/**
 * Pulls the specified mapping from individual mapping file. If one does not exist,
 * searches through sync.json for that mapping.
 * @param {String} mappingName unique name of mapping
 */
export function getSyncMapping(mappingName) {
  const url = `sync/mappings/${mappingName}`;

  return generateIdmApi().get(url);
}

export function previewMapping(payload) {
  return generateIdmApi().post('script?_action=eval', payload);
}

/**
 * Saves mapping to individual config .json file
 * @param {String} mappingName Name of mapping to save
 * @param {Object} payload Mapping details
 * @returns Promise with mapping details after save or failure results
 */
export function putConfigMapping(mappingName, payload) {
  return generateIdmApi().put(`config/mapping/${mappingName}?waitForCompletion=true`, payload);
}

export function putSyncMappings(payload) {
  return generateIdmApi().put('config/sync?waitForCompletion=true', payload);
}

/**
 * Removes indivdual mapping .json
 * @param {String} mappingName unique name of mapping
 * @returns Promise with results of delete
 */
export function deleteConfigMapping(mappingName) {
  return generateIdmApi().delete(`config/mapping/${mappingName}?waitForCompletion=true`);
}

export function getTargetPreview(resourceId, mapping) {
  const resourceUrl = `sync?_action=getTargetPreview&resourceId=${resourceId}&mapping=${mapping}`;
  return generateIdmApi().post(resourceUrl);
}
