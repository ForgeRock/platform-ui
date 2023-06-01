/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';
import encodeQueryString from '../utils/encodeQueryString';

export function getMappingDetails() {
  return generateIdmApi().get('/endpoint/mappingDetails');
}

export function getMappings(params) {
  const url = `sync/mappings${encodeQueryString(params)}`;

  return generateIdmApi().get(url);
}

export function getConfigSyncMappings() {
  return generateIdmApi().get('config/sync');
}

export function getMapping(mappingId) {
  const url = `sync/mappings/${mappingId}`;

  return generateIdmApi().get(url);
}

export function previewMapping(payload) {
  return generateIdmApi().post('script?_action=eval', payload);
}

export function putMappings(payload) {
  return generateIdmApi().put('config/sync?waitForCompletion=true', payload);
}

export function getTargetPreview(resourceId, mapping) {
  const resourceUrl = `sync?_action=getTargetPreview&resourceId=${resourceId}&mapping=${mapping}`;
  return generateIdmApi().post(resourceUrl);
}

export function buildQueryFilterMappingString(mappingNames) {
  if (!mappingNames || !mappingNames.length) {
    return true;
  }

  let queryFilter = '';
  mappingNames.forEach((mappingName, index) => {
    if (index) {
      queryFilter = `${queryFilter} OR `;
    }
    queryFilter = `${queryFilter}name eq "${mappingName}"`;
  });
  return queryFilter;
}
