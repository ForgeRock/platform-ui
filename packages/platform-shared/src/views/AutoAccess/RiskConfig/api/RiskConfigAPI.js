/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import _ from 'lodash';
// import { postData } from '../../Shared/utils/axios-utils';
import { generateAutoAccessApi, generateAutoAccessJas } from '@forgerock/platform-shared/src/api/BaseApi';

const processEntity = '/entity/search/common/process';

export const getConfigurationChangesPreview = (dataSource, processJSON) => {
  const payload = {
    filePath: dataSource.name,
    bucket: dataSource.bucket,
    processJSON,
    numOfEvents: 10,
  };
  return new Promise((resolve, reject) => {
    // postData('/api/processEvaluation/preview', payload).then((res) => {
    generateAutoAccessApi().post('/processEvaluation/preview', payload).then(({ data: res }) => {
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
    .catch((e) => {
      reject();
    });
});

export const saveRiskConfig = (payload) => new Promise((resolve, reject) => {
  // postData('/api/riskConfig', payload)
  generateAutoAccessApi().post('/riskConfig', payload)
    .then((response) => {
      resolve(true);
    })
    .catch((error) => {
      reject(error);
    });
});
