/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// import { postData } from 'auto-shared/src/utils/axios-utils';
import { generateAutoAccessJas } from '@forgerock/platform-shared/src/api/BaseApi';

export const saveRemoteIngest = (queryParam) => new Promise((resolve, reject) => {
  // postData('/jas/workflow', queryParam)
  generateAutoAccessJas().post('/workflow', queryParam)
    .then(({ data }) => {
      resolve(data);
    })
    .catch((e) => {
      reject(e);
    });
});
