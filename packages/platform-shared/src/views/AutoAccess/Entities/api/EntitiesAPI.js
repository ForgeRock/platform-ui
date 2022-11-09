/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { v4 as uuidv4 } from 'uuid';
import { generateAutoAccessApi, generateAutoAccessJas } from '@forgerock/platform-shared/src/api/BaseApi';
import { cleanUpEntityDefinition } from '../../EntityDefinitions/utils/entity-utils';

export const getEntityDefintionByName = (entityPath) => new Promise((resolve, reject) => {
  generateAutoAccessJas().get(`/entityDefinitions/${entityPath}?latest=true`)
    .then(({ data: result }) => {
      let entity = result[0];
      entity = cleanUpEntityDefinition(entity);
      resolve(entity);
    })
    .catch((error) => {
      reject(error);
    });
});

export const getEntityInstances = (entity, { size, searchAfter, sortObj }, filterObj) => new Promise((resolve, reject) => {
  const entityPath = `${entity.namespace}/${entity.name}`;
  const payload = {
    query: {
      size,
      track_total_hits: true,
      sort: [],
    },
  };

  if (filterObj && filterObj.length > 0) {
    payload.query.query = {
      bool: {
        must: filterObj,
      },
    };
  }

  if (searchAfter) {
    payload.query.search_after = searchAfter;
  }

  if (sortObj) {
    payload.query.sort = sortObj;
  }

  generateAutoAccessApi().post(`/jas/entity/search/${entityPath}/${entity.version}`, payload)
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((error) => {
      reject(error);
    });
});

export const saveEntityInstances = (entity, data, flag, tags, context, branch) => {
  const entityPath = `${entity.namespace}/${entity.name}`;
  return new Promise((resolve, reject) => {
    const payload = {
      branch: branch || 'actual',
      contextId: context || `UI Changes - ${uuidv4()}`,
      entityData: data,
      indexingRequired: true,
      tags: tags || {},
      indexInSync: true,
    };

    const operation = flag === 'create' ? 'persist' : 'upsert';
    const axiosOp = flag === 'create' ? generateAutoAccessJas().post : generateAutoAccessJas().patch;

    axiosOp(`entity/${operation}/${entityPath}/${entity.version}`, payload)
      .then(({ data: result }) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const deleteEntityInstance = (data, entity) => new Promise((resolve, reject) => {
  const payload = {
    branch: 'actual',
    contextId: `UI Changes - ${uuidv4()}`,
    entityData: data,
    indexingRequired: true,
    tags: {},
    indexInSync: true,
  };

  generateAutoAccessJas().delete(`/entity/delete/${entity.namespace}/${entity.name}/${entity.version}`, { data: payload })
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((error) => {
      reject(error);
    });
});

export const getTextAttributeValues = (entity, attributeName, attributeValue) => new Promise((resolve, reject) => {
  const payload = {
    query: {
      size: 0,
      aggs: {
        log_attributes: {
          filter: {
            bool: {
              must: [],
            },
          },
          aggs: {
            [attributeName]: {
              terms: {
                field: `${attributeName}.keyword`,
                size: 1000,
              },
            },
          },
        },
      },
    },
  };

  if (attributeValue) {
    payload.query.aggs.log_attributes.filter.bool.must.push(attributeValue);
  }

  generateAutoAccessApi().post(`/entity/search/${entity.namespace}/${entity.name}/${entity.version}`, payload)
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((error) => {
      reject(error);
    });
});

export const getMinMaxValues = (entity, attributeName) => new Promise((resolve, reject) => {
  const payload = {
    query: {
      size: 0,
      aggs: {
        max_aggr: {
          max: {
            field: attributeName,
          },
        },
        min_aggr: {
          min: {
            field: attributeName,
          },
        },
      },
    },
  };

  generateAutoAccessApi().post(`/entity/search/${entity.namespace}/${entity.name}/${entity.version}`, payload)
    .then(({ data: result }) => {
      resolve(result);
    })
    .catch((error) => {
      reject(error);
    });
});
