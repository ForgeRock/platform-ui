/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import _ from 'lodash';
// import { postData } from '../../Shared/utils/axios-utils';
import { generateAutoAccessApi, generateAutoAccessJas } from '@forgerock/platform-shared/src/api/BaseApi';
import { saveEntityInstances } from '../../Entities/api/EntitiesAPI';

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

export const getDefaultProcess = () => {
  const payload = {
    query: {
      query: {
        term: {
          process_id: 'default_prediction_process',
        },
      },
      sort: {
        'metadata.created': {
          order: 'desc',
        },
      },
      size: 1,
    },
  };
  return new Promise((resolve) => {
    // postData(processEntity, payload).then((res) => {
    generateAutoAccessJas().post(processEntity, payload).then(({ data: res }) => {
      resolve(_.get(res, 'hits.hits[0]._source', {}));
    });
  });
};

export const saveRiskConfig = (payload) => new Promise((resolve, reject) => {
  saveEntityInstances({ namespace: 'common', name: 'process', version: 0 }, [payload], 'edit')
    .then(() => {
      resolve(true);
    })
    .catch((error) => {
      reject(error);
    });
});
