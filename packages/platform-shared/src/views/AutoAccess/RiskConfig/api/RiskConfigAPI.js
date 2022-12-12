/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { generateAutoAccessApi } from '@forgerock/platform-shared/src/api/BaseApi';

export const getConfigurationChangesPreview = (dataSource, processJSON) => {
  const payload = {
    filePath: dataSource.name,
    bucket: dataSource.bucket,
    processJSON: { 'active-user-config': processJSON },
    numOfEvents: 10,
  };
  return new Promise((resolve, reject) => {
    generateAutoAccessApi().post('/processEvaluation/v2/preview', payload).then(({ data: res }) => {
      resolve(res);
    })
      .catch(() => {
        reject();
      });
  });
};

export const getDefaultProcess = () => new Promise((resolve, reject) => {
  generateAutoAccessApi().get('/v2/riskConfig/userConfig').then(({ data: res }) => {
    resolve(res);
  })
    .catch(() => {
      reject();
    });
});

export const saveRiskConfig = (payload) => new Promise((resolve, reject) => {
  generateAutoAccessApi().put('/v2/riskConfig/userConfig', payload)
    .then(() => {
      resolve(true);
    })
    .catch((error) => {
      reject(error);
    });
});
