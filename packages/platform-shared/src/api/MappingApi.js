/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateIdmApi } from '@forgerock/platform-shared/src/api/BaseApi';

export function getMappings(mappingNames) {
  if (!mappingNames?.length) {
    return generateIdmApi().get('/endpoint/mappingDetails');
  }

  const params = mappingNames.map((mappingName, index) => {
    const param = `name%20eq%20"${mappingName}"`;
    return index ? `%20OR%20${param}` : param;
  });

  const url = `sync/mappings?_queryFilter=${params.join('')}`;

  return generateIdmApi().get(url);
}

export function previewMapping(payload) {
  return generateIdmApi().post('script?_action=eval', payload);
}

export function putMappings(payload) {
  return generateIdmApi().put('config/sync', payload);
}

export function getTargetPreview(resourceId, mapping) {
  const resourceUrl = `sync?_action=getTargetPreview&resourceId=${resourceId}&mapping=${mapping}`;
  return generateIdmApi().post(resourceUrl);
}
